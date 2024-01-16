document.addEventListener('DOMContentLoaded', () => {
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('product-search');

    let debounceTimer;
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                console.log("Search query:", this.value);
                fetchProducts(categoryFilter ? categoryFilter.value : 'all', this.value);
            }, 300); // Adjust delay as needed
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            console.log("Filter changed to:", this.value); // this.value is now the category ID
            fetchProducts(this.value);
        });
    }

    // Fetch and display products for the first time after DOM is loaded
    fetchProducts('all');
    fetchFeaturedProducts(); 
    setInterval(moveSlider, 3000); // Add this line to fetch featured products
    const subpage = getCurrentSubpage();
    fetchProducts('all', '', subpage);
});

// Rest of your code...


function fetchProducts(categoryName, searchQuery = '') {
    console.log("Fetching products for category:", categoryName, "with search query:", searchQuery);
    const backendUrl = 'http://localhost:3000';
    fetch(`${backendUrl}/api/products?category=${encodeURIComponent(categoryName)}&search=${encodeURIComponent(searchQuery)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Received data:", data);
            displayProducts(data.items);
        })
        .catch(error => {
            console.error('Error fetching products:', error);
        });
}


function displayProducts(products, searchQuery) {
    const productGrid = document.getElementById('all-product-grid');
    productGrid.innerHTML = ''; // Clear any existing content

    products.forEach(product => {
        if (product.type === 'ITEM' && product.item_data) {
            const productName = product.item_data.name;
            const imageUrl = product.imageUrl || 'default-image-url.jpg'; // Default image URL
            const productDescription = product.item_data.description || '';
            const productPrice = product.item_data.variations[0].item_variation_data.price_money.amount / 100; // Assuming price is in the first variation and in cents

            // Create product elements
            const productDiv = document.createElement('div');
            productDiv.className = 'product-item';
            productDiv.innerHTML = `
                <img src="${imageUrl}" alt="${productName}" loading="lazy" style="width:300px; height:300px;">
                <h3>${productName}</h3>
                <p>${productDescription}</p>
                <p>$${productPrice.toFixed(2)}</p>
            `;

            productGrid.appendChild(productDiv); // Append to product grid
        }
    });
    updateProductGridLayout(); // Update the grid layout
}

function displayFilteredProducts(products, searchQuery) {
    const filteredProductGrid = document.getElementById('filtered-products');
    filteredProductGrid.innerHTML = ''; // Clear any existing content

    products.forEach(product => {
        if (product.type === 'ITEM' && product.item_data) {
            const productName = product.item_data.name;
            const imageUrl = product.imageUrl || 'default-image-url.jpg'; // Default image URL
            const productDescription = product.item_data.description || '';
            const productPrice = product.item_data.variations[0].item_variation_data.price_money.amount / 100; // Assuming price is in the first variation and in cents

            // Create product elements
            const productDiv = document.createElement('div');
            productDiv.className = 'filtered-item';
            productDiv.innerHTML = `
                <img src="${imageUrl}" alt="${productName}" loading="lazy" style="width:300px; height:300px;">
                <h3>${productName}</h3>
                <p>${productDescription}</p>
                <p>$${productPrice.toFixed(2)}</p>
            `;

            filteredProductGrid.appendChild(productDiv); // Append to filtered product grid
        }
    });
    updateProductGridLayout();
}

function updateProductGridLayout() {
    const productGrid = document.getElementById('all-product-grid');
    const productItems = productGrid.getElementsByClassName('product-item');
    const columnCount = 4; // Desired number of columns

    // Calculate the width for each column
    const columnWidth = (100 / columnCount) + '%';

    // Set the width for each product item to achieve the desired number of columns
    for (let i = 0; i < productItems.length; i++) {
        productItems[i].style.width = columnWidth;
    }
}




function addToCart(itemName, itemPrice, itemImage) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find(item => item.name === itemName);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            name: itemName, 
            price: parseFloat(itemPrice), 
            image: itemImage, 
            quantity: 1
        });
    }

    console.log("Cart before update:", JSON.stringify(cart)); // Debugging line
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log("Cart after update:", localStorage.getItem('cart')); // Debugging line

    updateCartItemCount(); // Update cart item count display if you have one
}

// Function to fetch and display featured products
function fetchFeaturedProducts() {
    const backendUrl = 'http://localhost:3000';
    const featuredCategoryID = 'M7T5QB4HWAR5CLKY7DJSTRFK'; // Replace with the actual category ID for "Featured Items"
    
    fetch(`${backendUrl}/api/products?category=${encodeURIComponent(featuredCategoryID)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Received featured products:", data);
            if (data.items && data.items.length > 0) {
                displayFeaturedProducts(data.items);
            } else {
                console.log("No featured products found for category:", featuredCategoryID);
            }
        })
        .catch(error => {
            console.error('Error fetching featured products:', error);
        });
}



function displayFeaturedProducts(products) {
    const swiperWrapper = document.getElementById('swiper-wrapper-featured');
    swiperWrapper.innerHTML = ''; // Clear any existing content

    products.forEach(product => {
        if (product.type === 'ITEM' && product.item_data) {
            const productName = product.item_data.name;
            const imageUrl = product.imageUrl || 'default-image-url.jpg';
            const productDescription = product.item_data.description || '';
            const productPrice = product.item_data.variations[0].item_variation_data.price_money.amount / 100;

            const productDiv = document.createElement('div');
            productDiv.className = 'swiper-slide';
            productDiv.innerHTML = `
                <div class="product-item">
                    <img src="${imageUrl}" alt="${productName}" loading="lazy" style="width:300px; height:300px;">
                    <h3>${productName}</h3>
                    <p>${productDescription}</p>
                    <p>$${productPrice.toFixed(2)}</p>
                </div>
            `;

            swiperWrapper.appendChild(productDiv); // Append to swiper-wrapper
        }
    });

    // Re-initialize or update Swiper
    initializeOrUpdateSwiper();
}

function initializeOrUpdateSwiper() {
    if (window.featuredProductsSwiper) {
        window.featuredProductsSwiper.update();
    } else {
        window.featuredProductsSwiper = new Swiper('.products-slider', {
            // Swiper configuration
            speed: 600,
            loop: true,
            autoplay: {
                delay: 2000,
                disableOnInteraction: false
            },
            slidesPerView: 'auto',
            pagination: {
                el: '.swiper-pagination',
                type: 'bullets',
                clickable: true
            }
        });
    }
}



let offset = 0;
let autoMoveDirection = 'right'; // Default direction for automatic movement

function moveSlider(direction = autoMoveDirection) {
    const track = document.getElementById('slider-track');
    const itemWidth = document.querySelector('.product-item').offsetWidth;
    const trackWidth = track.offsetWidth;
    const containerWidth = document.getElementById('featured-product-slider').offsetWidth;

    // Automatically switch direction at ends
    if (offset <= -(trackWidth - containerWidth)) {
        autoMoveDirection = 'left';
    } else if (offset >= 0) {
        autoMoveDirection = 'right';
    }

    // Move the slider
    if (direction === 'left') {
        offset = Math.min(offset + itemWidth, 0);
    } else { // Assuming direction is 'right'
        offset = Math.max(offset - itemWidth, -(trackWidth - containerWidth));
    }

    track.style.transform = `translateX(${offset}px)`;
}
const slider = document.getElementById('featured-product-slider');
let sliderInterval;

function startSlider() {
    sliderInterval = setInterval(moveSlider, 3000); // Adjust the interval as needed
}

function stopSlider() {
    clearInterval(sliderInterval);
}

slider.addEventListener('mouseover', stopSlider);
slider.addEventListener('mouseout', startSlider);

document.addEventListener('DOMContentLoaded', () => {
    fetchFeaturedProducts();
    startSlider(); // This starts the automatic movement of the slider
});

function getCurrentSubpage() {
    const path = window.location.pathname;
    if (path.includes('supplies')) {
        return 'AquariumSupplies';
    } else if (path.includes('accessories')) {
        return 'AccessoriesAndSupplies';
    } else if (path.includes('freshwater')) {
        return 'FreshwaterFish';
    } else if (path.includes('saltwater')) {
        return 'SaltwaterFishAndCoral';
    }
    return 'all'; // Default to 'all' if no specific subpage is matched
}