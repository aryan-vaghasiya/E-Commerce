
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

exports.searchProductsElastic = async (client, filters = {}) => {

    const {query: searchTerm, limit, offset} = filters

    const mainFilterClauses = [];
    const postFilterClauses = [];
    const sortClause = [];
    

    if (filters.priceRange) {
        const rangeArr = filters.priceRange.split(",");
        const from = rangeArr[0];
        const to = rangeArr[1];

        if(from && to){
            // mainFilterClauses.push({
            postFilterClauses.push({
                range: {
                    price: {
                        gte: parseFloat(from),
                        lte: parseFloat(to)
                    }
                }
            });
        }
        else if (from) {
            postFilterClauses.push({
                range: {
                    price: {
                        gte: parseFloat(from)
                    }
                }
            });
        }
    }

    if (filters.rating) {
        mainFilterClauses.push({
            range: {
                rating: {
                    gt: filters.rating
                }
            }
        });
    }

    if (filters.inStock) {
        mainFilterClauses.push({
            range: {
                stock: {
                    gt: 0
                }
            }
        });
    }

    if(filters.brands?.length > 0){
        const brandsArr = filters.brands.split(",")
        // console.log(brandsArr);
        postFilterClauses.push({
            terms:{
                "brand.keyword": brandsArr,
            }
        })
    }

    if(filters.sort){
        const [sortby, orderby] = filters.sort.split(",")

        sortClause.push({
            [sortby]: {
                order: orderby
            }
        })
    }

    const response = await client.search({
        index: 'products-search',
        body: {
            size: limit,
            from: offset,
            query: {
                bool: {
                    should: [
                        {
                            multi_match: {
                                query: searchTerm,
                                fields: ["title^5", "brand^3", "category^2", "description^1"],
                                type: "best_fields",
                                // "fuzziness": "AUTO",
                            }
                        }
                    ],
                    filter: mainFilterClauses,
                    minimum_should_match: searchTerm ? 1 : 0
                }
            },
            sort: sortClause,
            "aggs": {
                "brands": {
                    "terms": {
                        "field": "brand.keyword",
                        // "order": {"_key": "asc"},
                        "size": 100
                    }
                },
                "price_stats": {
                    "stats": {
                        "field": "price"
                    }
                },
            },
            post_filter: {
                bool: {
                    filter: postFilterClauses
                }
            }
        }
    });

    // console.log(response.aggregations);
    // console.log(response.hits.hits);
    // console.log(response.aggregations.brands.buckets);
    // console.log(response.aggregations.price_stats);

    return {
        products: response.hits.hits, 
        total: response.hits.total.value,
        brands: response.aggregations.brands.buckets,
        price_stats: {
            min: Math.floor(response.aggregations.price_stats.min || 0),
            max: Math.ceil(response.aggregations.price_stats.max || 1000)
        }
    };
}

exports.bulkUpdateThumbnails = async (client, products) => {
    if (!products || products.length === 0) {
        console.log("Product array is empty. Nothing to update.");
        return { successful: 0, failed: 0 };
    }

    console.log(`Preparing to update ${products.length} products...`);

    // The bulk API requires an array of action/document pairs.
    // We use flatMap to create this structure efficiently.
    const operations = products.flatMap(product => ([
        // Action: specifies the 'update' operation, the index, and the document ID
        { update: { _index: 'products-search', _id: product.id } },
        // Document: contains the partial document with the fields to update
        { doc: { thumbnail: product.thumbnail } }
    ]));

    try {
        const bulkResponse = await client.bulk({
            refresh: true, // Makes the changes immediately searchable
            body: operations
        });

        // The bulk response contains an 'errors' flag and an 'items' array
        if (bulkResponse.errors) {
            const erroredDocuments = [];
            // Collect all the failed operations
            bulkResponse.items.forEach((action, i) => {
                const operation = Object.keys(action)[0];
                if (action[operation].error) {
                    erroredDocuments.push({
                        status: action[operation].status,
                        error: action[operation].error,
                        operation: operations[i * 2],
                        document: operations[i * 2 + 1]
                    });
                }
            });
            console.error('ERROR: Some documents failed to update.', erroredDocuments);
        }
        
        const successfulUpdates = bulkResponse.items.filter(item => item.update && !item.update.error).length;
        console.log(`Successfully updated ${successfulUpdates} products.`);

        return {
            successful: successfulUpdates,
            failed: products.length - successfulUpdates
        };

    } catch (err) {
        console.error('Failed to execute bulk update:', err);
        return { successful: 0, failed: products.length };
    }
};