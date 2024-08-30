document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        fetchProductDetails(productId);
    } else {
        console.error('Product ID not found in URL');
    }
});

function fetchProductDetails(productId) {
    const backendUrl = '';

    // Show a loading state while fetching
    displayLoadingState();

    fetch(`${backendUrl}/api/products/${productId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(product => {
            displayProductDetails(product);
        })
        .catch(error => {
            console.error('Error fetching product:', error);
            displayErrorState();
        });
}

function displayLoadingState() {
    document.getElementById('product-name').textContent = 'Loading...';
    document.getElementById('product-description').textContent = 'Loading product details...';
}

function displayProductDetails(product) {
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-image').src = product.imageUrl || 'default-image-url.jpg';
    document.getElementById('product-description').textContent = product.description || 'No description available.';
    document.getElementById('product-price').textContent = `Price: $${product.price.toFixed(2)}`;
}

function displayErrorState() {
    document.getElementById('product-name').textContent = 'Product not found';
    document.getElementById('product-image').src = 'error-image-url.jpg';
    document.getElementById('product-description').textContent = 'We couldn’t find the product you’re looking for.';
    document.getElementById('product-price').textContent = '';
}
