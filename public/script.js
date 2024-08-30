document.addEventListener('DOMContentLoaded', function() {
    loadComponent('navigation.html', 'navigation-placeholder');
    loadComponent('footer.html', 'footer-placeholder');
    loadComponent('holiday-notice.html', 'holiday-notice-placeholder');

    // Add event listener for closing the image
    const closeButton = document.querySelector('.close-button');
    if (closeButton) {
        closeButton.addEventListener('click', closeImage);
    }

    const dropdowns = document.querySelectorAll('nav > ul > li');
    
    dropdowns.forEach(function(dropdown) {
        dropdown.addEventListener('click', function(event) {
            // Close any open submenus first
            const openSubmenus = document.querySelectorAll('.submenu');
            openSubmenus.forEach(function(submenu) {
                if (submenu !== this.querySelector('.submenu')) {
                    submenu.style.display = 'none';
                }
            });

            // Toggle the current submenu
            const submenu = this.querySelector('.submenu');
            if (submenu) {
                submenu.style.display = submenu.style.display === "block" ? "none" : "block";
            }
        });
    });

    // Handling the CTA button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            console.log('CTA button clicked!');
        });
    }

    // Cart icon event listener for mini-cart dropdown
    const cartIconContainer = document.querySelector('.cart-icon-container');
    if (cartIconContainer) {
        cartIconContainer.addEventListener('click', function(event) {
            const miniCart = document.querySelector('.mini-cart-dropdown');
            const cartIcon = document.querySelector('.cart-icon');

            // Check if the clicked element is not the cart icon itself
            if (!cartIcon.contains(event.target)) {
                event.preventDefault(); // Prevents navigating to cart.html
                miniCart.style.display = miniCart.style.display === 'none' ? 'block' : 'none';
            }
        });
    }

    // Add to Cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart-button');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productItem = this.closest('.product-item');
            const productId = productItem.dataset.productId; // Unique product ID
            const productName = productItem.querySelector('h3').innerText;
            const productPrice = productItem.querySelector('.price').innerText;
            const productImage = productItem.querySelector('img').src;

            const product = {
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            };

            addToCart(product);
        });
    });

    // Update mini-cart display on page load
    updateMiniCartDisplay();

    // Fetch and display featured products
    fetchFeaturedProducts(); // Add this line here

    // Initialize Swiper for testimonials
    new Swiper('.testimonials-slider', {
        speed: 600,
        loop: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false
        },
        slidesPerView: 'auto',
        pagination: {
            el: '.swiper-pagination',
            type: 'bullets',
            clickable: true
        }
    });

    new Swiper('.products-slider', {
        speed: 600,
        loop: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false
        },
        slidesPerView: 'auto',
        pagination: {
            el: '.swiper-pagination',
            type: 'bullets',
            clickable: true
        }
    });
});

// Function to fetch and display featured products
function fetchFeaturedProducts() {
    const backendUrl = '/api/products?category=M7T5QB4HWAR5CLKY7DJSTRFK'; // Adjust the category ID for featured items

    fetch(backendUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const swiperWrapper = document.getElementById('swiper-wrapper-featured');
            swiperWrapper.innerHTML = ''; // Clear any existing content

            if (data.items && data.items.length > 0) {
                data.items.forEach(product => {
                    if (product.type === 'ITEM' && product.item_data) {
                        const productDiv = document.createElement('div');
                        productDiv.className = 'swiper-slide';
                        productDiv.innerHTML = `
                            <div class="product-item">
                                <img src="${product.imageUrl || 'default-image-url.jpg'}" alt="${product.item_data.name}" style="width:300px; height:300px;">
                                <h3>${product.item_data.name}</h3>
                                <p>$${(product.item_data.variations[0].item_variation_data.price_money.amount / 100).toFixed(2)}</p>
                            </div>
                        `;
                        swiperWrapper.appendChild(productDiv);
                    }
                });

                // Re-initialize or update Swiper after adding new slides
                new Swiper('.products-slider', {
                    speed: 600,
                    loop: true,
                    autoplay: {
                        delay: 3000,
                        disableOnInteraction: false
                    },
                    slidesPerView: 'auto',
                    pagination: {
                        el: '.swiper-pagination',
                        type: 'bullets',
                        clickable: true
                    }
                });
            } else {
                swiperWrapper.innerHTML = '<p>No featured products available at the moment.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching featured products:', error);
        });
}

// Initialize AOS
AOS.init({
    duration: 1000,
    easing: 'ease-in-out',
    once: true,
    mirror: false
});

function loadComponent(componentPath, placeholderId) {
    fetch(componentPath)
        .then(response => response.text())
        .then(html => {
            document.getElementById(placeholderId).innerHTML = html;
        })
        .catch(error => console.error(`Failed to load ${componentPath}:`, error));
}
