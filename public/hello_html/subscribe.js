document.getElementById('subscribe-form').addEventListener('submit', function(event) {
    event.preventDefault();
    var formData = {
        email: document.getElementById('email').value
    };

    fetch('https://script.google.com/macros/s/AKfycbwxqTc1NOXyKM96DhaveFLGIexej8a71LcRQifru1zkpfp5C0E2yT7Xmn0u0egeDP3B/exec', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    .then(response => response.text())
    .then(data => {
        document.getElementById('subscribe-section').innerHTML = `<p>Thank you for subscribing!</p>`;
        // This replaces the content of subscribe-section with the thank you message
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('subscription-message').innerText = 'There was an error processing your subscription.';
    });
});
