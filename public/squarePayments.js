async function initializeCard(payments) {
    const card = await payments.card();
    await card.attach('#card-container');

    return card;
}

async function createPayment(token) {
    const body = JSON.stringify({
        nonce: token,
        // Add other payment details like `amount` here
    });

    const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body
    });

    if (response.ok) {
        console.log('Payment successful!');
    } else {
        console.error('Payment failed.');
    }
}

async function setupSquarePayment(appId) {
    if (!window.Square) {
        throw new Error('Square.js failed to load properly');
    }

    let payments = window.Square.payments(appId, 'YOUR_SANDBOX_LOCATION_ID');
    let card = await initializeCard(payments);

    document.getElementById('card-button').addEventListener('click', async () => {
        const result = await card.tokenize();
        if (result.status === 'OK') {
            await createPayment(result.token);
        } else {
            console.error('Tokenization failed:', result.errors);
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/square/config');
        const config = await response.json();
        setupSquarePayment(config.applicationId);
    } catch (error) {
        console.error('Error fetching Square config:', error);
    }
});
