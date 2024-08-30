import path from 'path';
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
const cache = new NodeCache({ stdTTL: 600, checkperiod: 1200 }); // Cache for 10 minutes

const __dirname = path.dirname(new URL(import.meta.url).pathname);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

const SQUARE_SANDBOX_ACCESS_TOKEN = process.env.SQUARE_SANDBOX_ACCESS_TOKEN;
const SQUARE_APPLICATION_ID = process.env.SQUARE_APPLICATION_ID;

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
    const allObjects = await fetchAllItems();
    const categories = allObjects.filter(obj => obj.type === 'CATEGORY');

    const categoryMap = new Map();
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const cacheKey = `${categoryFilter}-${searchQuery}-${page}-${limit}`;

        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }

        let allItems = await fetchAllItems();

        // Filtering based on category
        if (categoryFilter && categoryFilter !== 'all') {
            allItems = allItems.filter(item =>
                item.item_data &&
                item.item_data.categories &&
                item.item_data.categories.some(category => category.id === categoryFilter)
            );
        }

        // Filtering based on search query
        if (searchQuery) {
            allItems = allItems.filter(item =>
                item.item_data &&
                item.item_data.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Paginate items
        const paginatedItems = allItems.slice((page - 1) * limit, page * limit);
        const imageIds = paginatedItems.flatMap(item => item.item_data.image_ids || []).filter(id => id);

        // Fetch and map images
        if (imageIds.length > 0) {
            const imageMap = await fetchImages(imageIds);
            paginatedItems.forEach(item => {
                item.imageUrl = item.item_data.image_ids ? imageMap.get(item.item_data.image_ids[0]) : null;
            });
        }

        const response = {
            items: paginatedItems,
            totalItems: allItems.length,
            totalPages: Math.ceil(allItems.length / limit),
            currentPage: page
        };

        cache.set(cacheKey, response);
        res.json(response);
    } catch (error) {
        console.error('Error in /api/products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const cacheKey = `product-${productId}`;
        const cachedProduct = cache.get(cacheKey);

        if (cachedProduct) {
            return res.json(cachedProduct);
        }

        const allItems = await fetchAllItems();

        const product = allItems.find(item => item.id === productId);
        if (product) {
            const { name, description, image_ids, variations } = product.item_data;
            const essentialProductData = {
                id: product.id,
                name,
                description,
                imageUrl: image_ids ? await getImageUrl(image_ids[0]) : null,
                price: variations[0]?.item_variation_data?.price_money?.amount / 100 || 0, // Convert cents to dollars
            };

            cache.set(cacheKey, essentialProductData);
            res.json(essentialProductData);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

async function fetchImages(imageIds) {
    const batchSize = 100;
    const imageMap = new Map();

    for (let i = 0; i < imageIds.length; i += batchSize) {
        const batch = imageIds.slice(i, i + batchSize);

        try {
            const imageResponse = await fetch('https://connect.squareup.com/v2/catalog/batch-retrieve', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SQUARE_SANDBOX_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ object_ids: batch })
            });

            if (!imageResponse.ok) {
                throw new Error(`Failed to fetch images. Status: ${imageResponse.status}`);
            }

            const imageData = await imageResponse.json();
            if (imageData && Array.isArray(imageData.objects)) {
                imageData.objects.forEach(obj => {
                    imageMap.set(obj.id, obj.image_data.url);
                });
            }
        } catch (error) {
            console.error(`Error fetching images for batch ${i / batchSize + 1}:`, error);
        }
    }

    return imageMap;
}

async function getImageUrl(imageId) {
    try {
        const cacheKey = `image-${imageId}`;
        const cachedUrl = cache.get(cacheKey);

        if (cachedUrl) {
            return cachedUrl;
        }

        const response = await fetch(`https://connect.squareup.com/v2/catalog/object/${imageId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SQUARE_SANDBOX_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        const imageUrl = data.object.image_data?.url || 'default-image-url.jpg';

        cache.set(cacheKey, imageUrl);
        return imageUrl;
    } catch (error) {
        console.error('Error fetching image URL:', error);
        return 'default-image-url.jpg';
    }
}

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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
