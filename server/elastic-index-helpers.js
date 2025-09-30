
exports.createProductIndex = async (client, indexName = 'products') => {
    console.log(`Checking for index "${indexName}"...`);

    try {
        // 1. Check if the index already exists
        const indexExists = await client.indices.exists({ index: indexName });

        if (indexExists) {
            console.log(`Index "${indexName}" already exists. Skipping creation.`);
            return;
        }

        console.log(`Index "${indexName}" does not exist. Creating...`);

        // 2. Define the mapping (schema) for the product data
        const mappings = {
            properties: {
                id: { type: 'keyword' },
                title: { type: 'text' },
                description: { type: 'text' },
                rating: { type: 'half_float' },
                brand: {
                    type: 'text',
                    fields: {
                        keyword: { type: 'keyword' }
                    }
                },
                status: { type: 'keyword' },
                category: { type: 'keyword' },
                mrp: { type: 'float' },
                stock: { type: 'integer' },
                offer_discount: { type: 'integer' },
                price: { type: 'float' },
                wishlisted: { type: 'boolean' },
            },
        };

        // 3. Create the index with the specified mapping
        await client.indices.create({
            index: indexName,
            body: {
                settings: {
                    number_of_replicas: 0,   // single-node cluster safe
                    number_of_shards: 1      // optional, default is 1 for small setups
                },
                mappings: mappings,
            },
        });

        console.log(`✅ Successfully created index "${indexName}" with the defined mapping.`);
    } 
    catch (error) {
        console.error(`❌ Failed to create index "${indexName}":`, error);
    }
}


exports.indexBulkProducts = async (client, products, indexName = 'products') => {
    if (!products || products.length === 0) {
        console.log("No products to index.");
        return;
    }

    console.log(`Indexing ${products.length} products in bulk...`);

    // Transform the product array into the format required by the bulk API
    const operations = products.flatMap(product => [
        { index: { _index: indexName, _id: product.id } },
        {
            title: product.title,
            description: product.description,
            rating: product.rating,
            brand: product.brand,
            status: product.status,
            category: product.category,
            mrp: product.mrp,
            stock: product.stock,
            offer_discount: product.offer_discount,
            price: product.price,
            wishlisted: product.wishlisted > 0,
        }
    ]);

    try {
        const bulkResponse = await client.bulk({ refresh: true, operations });

        if (bulkResponse.errors) {
            console.error('Bulk indexing had errors.');
            // You can loop through bulkResponse.items for detailed error info
        } 
        else {
            console.log(`✅ Successfully indexed ${products.length} products.`);
        }
    } 
    catch (error) {
        console.error('❌ Failed to perform bulk indexing:', error);
    }
}