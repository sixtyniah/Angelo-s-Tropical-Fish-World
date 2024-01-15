import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';
import compression from 'compression';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(compression());

const SQUARE_SANDBOX_ACCESS_TOKEN = process.env.SQUARE_SANDBOX_ACCESS_TOKEN;
const SQUARE_APPLICATION_ID = process.env.SQUARE_APPLICATION_ID;
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 1200 });


async function fetchAllItems(cursor = null, allItems = []) {
    const cacheKey = 'allItems';
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    let url = 'https://connect.squareup.com/v2/catalog/list';
    if (cursor) {
        url += `?cursor=${cursor}`;
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${SQUARE_SANDBOX_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    allItems = allItems.concat(data.objects.filter(obj => obj.type === 'ITEM'));
    if (data.cursor) {
        return await fetchAllItems(data.cursor, allItems);
    } else {
        cache.set(cacheKey, allItems);
        return allItems;
    }
}



async function fetchCategoryMap() {
    let allObjects = await fetchAllItems();
    let categories = allObjects.filter(obj => obj.type === 'CATEGORY');

    let categoryMap = new Map();
    categories.forEach(cat => {
        if (cat.category_data && cat.category_data.name) {
            categoryMap.set(cat.id, cat.category_data.name);
        }
    });

    return categoryMap;
}

app.get('/api/products', async (req, res) => {
    try {
        const categoryFilter = req.query.category || 'all';
        const searchQuery = req.query.search || '';

        let allItems = await fetchAllItems();
        let categoryMap = await fetchCategoryMap();

        if (categoryFilter !== 'all') {
            allItems = allItems.filter(item =>
                item.item_data &&
                item.item_data.categories &&
                item.item_data.categories.some(category => category.id === categoryFilter)
            );
        }

        if (searchQuery) {
            allItems = allItems.filter(item =>
                item.item_data &&
                item.item_data.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        // Image processing
        const imageIds = allItems.flatMap(item => item.item_data.image_ids || []).filter(id => id);
        if (imageIds.length > 0) {
            const imageResponse = await fetch('https://connect.squareup.com/v2/catalog/batch-retrieve', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SQUARE_SANDBOX_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ object_ids: imageIds })
            });
            const imageData = await imageResponse.json();
            const imageMap = new Map(imageData.objects.map(obj => [obj.id, obj.image_data.url]));

            allItems = allItems.map(item => ({
                ...item,
                imageUrl: item.item_data.image_ids ? imageMap.get(item.item_data.image_ids[0]) : null
            }));
        }


        const finalData = { items: allItems };
        res.json(finalData);
    } catch (error) {
        console.error('Error in /api/products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.post('/api/subscribe', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        console.log(`New subscription request: ${email}`);
        res.status(200).json({ message: 'Subscription successful' });
    } catch (error) {
        console.error('Error handling subscription:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/square/config', (req, res) => {
    res.json({ applicationId: SQUARE_APPLICATION_ID });
});

app.post('/process-payment', async (req, res) => {
    const { nonce, amount } = req.body;
    console.log(`Processing payment for amount: ${amount} with nonce: ${nonce}`);
    res.json({ message: 'Payment processed successfully', amount: amount });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
