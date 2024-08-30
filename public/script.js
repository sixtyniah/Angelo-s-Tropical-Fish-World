

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
});

function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find(item => item.id === product.id);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push(product);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    updateMiniCartDisplay();
}

function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartItemCount = document.getElementById('cart-item-count');
    if (cartItemCount) {
        cartItemCount.innerText = itemCount;
    }
}

function updateMiniCartDisplay() {
    const miniCart = document.querySelector('.mini-cart-dropdown');
    if (miniCart) {
        miniCart.innerHTML = ''; // Clear existing mini-cart items
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.forEach(item => {
            const miniCartItemEl = document.createElement('div');
            miniCartItemEl.className = 'mini-cart-item';
            miniCartItemEl.innerHTML = `
                <img src="${item.image}" alt="${item.name}" style="width: 50px; height: auto;">
                <span>${item.name}</span> x <span>${item.quantity}</span>
                <span>${item.price}</span>
            `;
            miniCart.appendChild(miniCartItemEl);
        });
    }
}


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

// function to show image when we click on a image
