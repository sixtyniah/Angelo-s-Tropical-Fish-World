document.addEventListener('DOMContentLoaded', () => {
    const subpageCategories = getSubpageCategories();
    fetchProducts(subpageCategories);

    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('product-search');

    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            // Fetch products for a specific category if selected, otherwise fetch for all subpage categories
            fetchProducts(this.value !== 'all' ? [this.value] : subpageCategories, searchInput ? searchInput.value : '');
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            fetchProducts(subpageCategories, this.value);
        });
    }
});

function getSubpageCategories() {
    const path = window.location.pathname;
    if (path.includes('supplies')) {
        return ['Aquariums/fish bowls', 'Chemicals', 'Filters/Pumps', 'Frag', 'Heaters/ Thermometers', 'Tubing/Valves' ];
    } else if (path.includes('accessories')) {
        return ['Decor', 'Driftwood', 'Gravel/Sand', 'Fish Food', 'Lighting', 'Nets', 'Plants'];
    } else if (path.includes('freshwater')) {
        return ['Freshwater Fish'];
    } else if (path.includes('saltwater')) {
        return ['Coral', 'Saltwater Fish'];
    }
    // Add more conditions for other subpages
    return [];
}

function fetchProducts(categories, searchQuery = '') {
    const backendUrl = 'http://localhost:3000';
    let apiUrl = `${backendUrl}/api/products?categories=${encodeURIComponent(categories.join(','))}`;
    if (searchQuery) {
        apiUrl += `&search=${encodeURIComponent(searchQuery)}`;
    }

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayProducts(data.items);
        })
        .catch(error => {
            console.error('Error fetching products:', error);
        });
}

function displayProducts(products) {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) {
        console.error("Product grid element not found.");
        return;
    }

    productGrid.innerHTML = '';

    products.forEach(product => {
        if (product.type === 'ITEM' && product.item_data) {
            const productName = product.item_data.name;
            const imageUrl = product.imageUrl || 'default-image-url.jpg';
            const productDescription = product.item_data.description || '';
            const productPrice = product.item_data.variations[0].item_variation_data.price_money.amount / 100;

            const productDiv = document.createElement('div');
            productDiv.className = 'product-item';
            productDiv.innerHTML = `
                <img src="${imageUrl}" alt="${productName}" loading="lazy" style="width:100px; height:100px;">
                <h3>${productName}</h3>
                <p>${productDescription}</p>
                <p>$${productPrice.toFixed(2)}</p>
            `;
            productGrid.appendChild(productDiv);
        }
    });
}
