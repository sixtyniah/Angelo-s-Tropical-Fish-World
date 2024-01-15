document.addEventListener('DOMContentLoaded', function() {
    updateCartPageDisplay();
    updateCartTotal();
    updateCartItemCount();

    const cartItemsContainer = document.getElementById('cart-items');
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('input', function(event) {
            if (event.target.classList.contains('item-quantity')) {
                const input = event.target;
                const itemName = input.closest('.cart-item').querySelector('.item-name').innerText;
                updateItemQuantity(itemName, input.value);
            }
        });
    }

    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', handleCheckout);
    }

    initializeSquarePaymentForm();
});

function initializeSquarePaymentForm() {
    fetch('http://localhost:3000/api/square/config')
        .then(response => response.json())
        .then(config => {
            window.paymentForm = new SqPaymentForm({
                applicationId: config.applicationId,
                inputClass: 'sq-input',
                autoBuild: false,
                cardNumber: { elementId: 'sq-card-number', placeholder: 'Card Number' },
                cvv: { elementId: 'sq-cvv', placeholder: 'CVV' },
                expirationDate: { elementId: 'sq-expiration-date', placeholder: 'MM/YY' },
                postalCode: { elementId: 'sq-postal-code', placeholder: 'Postal' },
                callbacks: {
                    cardNonceResponseReceived: function(errors, nonce, cardData) {
                        if (errors) {
                            errors.forEach(function(error) {
                                console.error(error.message);
                            });
                            return;
                        }
                        processPayment(nonce);
                    }
                }
            });

            window.paymentForm.build();
        })
        .catch(error => console.error('Error fetching Square config:', error));
}

function handleCheckout() {
    if (!window.paymentForm) {
        console.error("Payment form not initialized.");
        return;
    }
    window.paymentForm.requestCardNonce();
}

function processPayment(nonce) {
    fetch('http://localhost:3000/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nonce: nonce, amount: calculateTotalAmount() })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Payment successful:', data);
        // Additional code to handle successful payment
    })
    .catch(error => console.error('Payment processing error:', error));
}

function calculateTotalAmount() {
    let total = 0;
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.forEach(item => {
        total += item.price * item.quantity;
    });
    return total;
}

function updateItemQuantity(itemName, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find(item => item.name === itemName);

    if (existingProduct) {
        existingProduct.quantity = Math.max(parseInt(newQuantity, 10), 0);
        cart = cart.filter(item => item.quantity > 0);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartPageDisplay();
    updateCartTotal();
    updateCartItemCount();
}

function updateCartPageDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = '';
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    cart.forEach(item => {
        if (item && item.name && item.price) {
            const cartItemEl = document.createElement('div');
            cartItemEl.className = 'cart-item';
            cartItemEl.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <span class="item-name">${item.name}</span>
                <input type="number" class="item-quantity" value="${item.quantity}" min="0" style="width: 50px;">
                <span class="item-price">$${parseFloat(item.price).toFixed(2)}</span>
            `;
            cartItemsContainer.appendChild(cartItemEl);
        }
    });
}

function updateCartTotal() {
    let items = document.querySelectorAll('.cart-item');
    let total = 0;

    items.forEach(item => {
        let priceElement = item.querySelector('.item-price');
        let quantityElement = item.querySelector('.item-quantity');
        let price = parseFloat(priceElement.innerText.replace('$', '')) || 0;
        let quantity = parseInt(quantityElement.value, 10) || 0;
        total += price * quantity;
    });

    let subtotalElement = document.getElementById('subtotal');
    let taxesElement = document.getElementById('taxes');
    let totalElement = document.getElementById('total');

    if (subtotalElement && taxesElement && totalElement) {
        subtotalElement.innerText = '$' + total.toFixed(2);
        let taxRate = 0.1; // Example: 10% tax rate
        taxesElement.innerText = '$' + (total * taxRate).toFixed(2);
        totalElement.innerText = '$' + (total * (1 + taxRate)).toFixed(2);
    }
}

function updateCartItemCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalCount = cart.reduce((count, item) => count + (item && item.quantity ? item.quantity : 0), 0);
    const countElement = document.getElementById('cart-item-count');
    if (countElement) {
        countElement.innerText = totalCount;
    }
}
