document.addEventListener('DOMContentLoaded', () => {
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('product-search');

    let debounceTimer;
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                fetchProducts(categoryFilter ? categoryFilter.value : 'all', this.value);
            }, 300); // Adjust delay as needed
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            fetchProducts(this.value);
        });
    }

    fetchProducts('all');
    fetchFeaturedProducts();
    setInterval(moveSlider, 3000);
});

document.addEventListener('DOMContentLoaded', () => {
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('product-search');
    let debounceTimer;

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                fetchProducts(categoryFilter ? categoryFilter.value : 'all', this.value);
            }, 300);
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            fetchProducts(this.value);
        });
    }

    fetchProducts('all');
});

function fetchProducts(categoryName = 'all', searchQuery = '', page = 1, limit = 20) {
    const backendUrl = '';
    const queryParams = new URLSearchParams({
        category: categoryName,
        search: searchQuery,
        page: page,
        limit: limit
    });

    document.getElementById('all-product-grid').innerHTML = '<p>Loading...</p>';

    fetch(`${backendUrl}/api/products?${queryParams.toString()}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayProducts(data.items);
            setupPagination(data.totalPages, data.currentPage, categoryName, searchQuery);
            updateGridLayout('all-product-grid'); // Add this line to update the layout
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            document.getElementById('all-product-grid').innerHTML = '<p>Failed to load products. Please try again later.</p>';
        });
}


function displayProducts(products) {
    const productGrid = document.getElementById('all-product-grid');
    productGrid.innerHTML = ''; // Clear any existing content

    products.forEach(product => {
        if (product.type === 'ITEM' && product.item_data) {
            const productId = product.id;
            const productName = product.item_data.name;
            const imageUrl = product.imageUrl || 'default-image-url.jpg';
            const productPrice = product.item_data.variations[0].item_variation_data.price_money.amount / 100;

            const productDiv = document.createElement('div');
            productDiv.className = 'product-item';
            productDiv.innerHTML = `
                <a href="product.html?id=${productId}">
                    <img data-src="${imageUrl}" alt="${productName}" class="lazy" loading="lazy" style="width:300px; height:300px;">
                    <h3>${productName}</h3>
                </a>
                <p>$${productPrice.toFixed(2)}</p>
            `;

            productGrid.appendChild(productDiv);
        }
    });

    lazyLoadImages(); // Call lazy loading function
}


function lazyLoadImages() {
    const lazyImages = document.querySelectorAll('img.lazy');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });
}


function setupPagination(totalPages, currentPage, categoryName, searchQuery) {
    const paginationContainer = document.getElementById('pagination-container');
    const pageIndicator = document.getElementById('page-indicator');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const jumpInput = document.getElementById('jump-to-page');
    const jumpButton = document.getElementById('jump-button');

    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;

    jumpInput.value = currentPage;
    jumpInput.max = totalPages;

    prevButton.onclick = () => {
        if (currentPage > 1) {
            fetchProducts(categoryName, searchQuery, currentPage - 1);
        }
    };

    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            fetchProducts(categoryName, searchQuery, currentPage + 1);
        }
    };

    jumpButton.onclick = () => {
        const page = parseInt(jumpInput.value);
        if (page >= 1 && page <= totalPages) {
            fetchProducts(categoryName, searchQuery, page);
        } else {
            alert(`Please enter a valid page number between 1 and ${totalPages}`);
        }
    };
}





// The other functions, such as fetchFeaturedProducts and moveSlider, remain unchanged.


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
            productDiv.innerHTML = `
            <div class="product-item">
                <img src="${imageUrl}" alt="${productName}" loading="lazy" style="width:300px; height:300px;">
                <h3>${productName}</h3>
                <p>${productDescription}</p>
                <p>$${productPrice.toFixed(2)}</p>
                </div>
            `;

            filteredProductGrid.appendChild(productDiv); // Append to filtered product grid
        }
    });
}



function updateGridLayout(gridId) {
    const productGrid = document.getElementById(gridId);
    if (!productGrid) return;

    // No need to set widths manually; let CSS Grid handle it.
    const productItems = productGrid.getElementsByClassName('product-item');
    // Remove the loop that manually sets the width of product items
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
// Function to fetch and display featured products
function fetchFeaturedProducts() {
    const backendUrl = ''; // Make sure this points to your backend API
    const featuredCategoryID = 'M7T5QB4HWAR5CLKY7DJSTRFK'; // Replace with the actual category ID for "Featured Items"
    
    fetch(`${backendUrl}/api/products?category=${encodeURIComponent(featuredCategoryID)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
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

// Function to display the fetched products in the Swiper slider
function displayFeaturedProducts(products) {
    const swiperWrapper = document.getElementById('swiper-wrapper-featured');
    swiperWrapper.innerHTML = ''; // Clear any existing content

    products.forEach(product => {
        if (product.type === 'ITEM' && product.item_data) {
            const productName = product.item_data.name;
            const imageUrl = product.imageUrl || 'default-image-url.jpg'; // Fallback if no image is available
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

            swiperWrapper.appendChild(productDiv); // Append each product as a slide
        }
    });

    // Re-initialize or update Swiper
    initializeOrUpdateSwiper();
}

// Function to initialize or update the Swiper instance
function initializeOrUpdateSwiper() {
    if (window.featuredProductsSwiper) {
        window.featuredProductsSwiper.update();
    } else {
        window.featuredProductsSwiper = new Swiper('.products-slider', {
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

// Ensure the featured products are fetched when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchFeaturedProducts();
});


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