const runQuery = require("../db");
const dayjs = require("dayjs");
const client = require('../elastic-client');
const { createProductIndex, indexBulkProducts, searchProductsElastic, bulkUpdateThumbnails } = require('../elastic-index-helpers');

exports.getAllProducts = async(page, limit, offset, userId) => {
    const products = await runQuery(`SELECT id FROM products ORDER BY id ASC LIMIT ? OFFSET ?`, [limit, offset])
    const productIds = products.map(item => item.id)

    const results = await this.getProductsByIdsHelper(productIds, userId)

    if(results.length === 0){
        throw new Error ("Could not select all products")
    }

    const [{total}] = await runQuery("SELECT COUNT(*) as total FROM products")
    if(!total){
        throw new Error ("Could not count total products")
    }

    const productsRes = {
        products : results,
        currentPage : page,
        pages: Math.ceil (total / limit),
        total
    }
    return productsRes
}

exports.getSearchedProducts = async (queryParams, userId) => {

    const {
        query,
        page,
        limit,
        offset,
        priceRange,
        inStock,
        rating
    } = queryParams

    // console.log(priceRange);

    // if(query.trim().length < 1){
    //     return {}
    // }

    // let whereClause = ` WHERE (title LIKE CONCAT('%', ?, '%') OR description LIKE CONCAT('%', ?, '%')) `
    // const params = [userId, query, query]

    // if(priceRange){
    //     const rangeArr = priceRange.split(",")
    //     // console.log(rangeArr);
    //     const from = rangeArr[0]
    //     const to = rangeArr[1]

    //     whereClause += ` AND price >= ? AND (? = '' OR price <= ?) `
    //     params.push(from, to, to)
    // }

    // if(inStock === 'true'){
    //     whereClause += ` AND stock > ?`
    //     params.push(0)
    // }

    // if(rating){
    //     whereClause += ` AND rating >= ?`
    //     params.push(rating)
    // }


    // const finalQuery = 
    //     `SELECT
    //         *,
    //         COUNT(*) OVER() AS total_filtered
    //     FROM (
    //         SELECT 
    //             p.id,
    //             p.title,
    //             p.description,
    //             p.rating,
    //             p.brand,
    //             p.thumbnail,
    //             p.status,
    //             c.category,
    //             pp.mrp, 
    //             i.stock,
                
    //             CASE 
    //                 WHEN pd.offer_price IS NOT NULL 
    //                     THEN ROUND(((pp.mrp - pd.offer_price) / pp.mrp) * 100, 2)
    //                 ELSE NULL
    //             END AS offer_discount,
    //             CASE 
    //                 WHEN pd.offer_price IS NOT NULL 
    //                     THEN pd.offer_price
    //                 ELSE pp.price
    //             END AS price,
                
    //             CASE 
    //                 WHEN wi.product_id IS NOT NULL THEN TRUE 
    //                 ELSE FALSE 
    //             END AS wishlisted

    //         FROM 
    //             products p
    //         JOIN 
    //             product_inventory i ON p.id = i.product_id
    //         JOIN 
    //             categories c ON c.id = p.category_id
    //         JOIN 
    //             product_pricing pp ON p.id = pp.product_id 
    //             AND NOW() BETWEEN pp.start_time AND pp.end_time
    //         LEFT JOIN 
    //             product_discounts pd ON p.id = pd.product_id 
    //             AND pd.is_active = 1 
    //             AND NOW() BETWEEN IFNULL(pd.start_time, NOW()) AND IFNULL(pd.end_time, NOW())
    //         LEFT JOIN 
    //             wishlist_items wi ON p.id = wi.product_id 
    //             AND wi.wishlist_id = (SELECT id FROM wishlists WHERE user_id = ? AND name = 'my_wishlist') 
            
    //         WHERE
    //             1 = 1
    //             -- p.status = 'active'
    //     ) AS FilterableProducts

    //     ${whereClause}

    //     -- LIMIT ? OFFSET ?`

    // params.push(limit, offset)

    // const results = await runQuery(finalQuery, params)


    const {total, products, brands} = await searchProductsElastic(client, queryParams)
    // const results = normalizeProducts(products)

    if(products.length < 1){
        return {}
    }

    if(!userId){
        const results = products.map(item => item._source)

        const productsRes = {
            products : results,
            currentPage : page,
            pages: Math.ceil (total / limit),
            total,
            brands
        }
        return productsRes
    }

    const ids = products.map(item => item._source.id)

    const [{id: wishlist_id}] = await runQuery(`
        SELECT id FROM wishlists WHERE user_id = ? AND name = ?
        `, [userId, "my_wishlist"]);
    const wishlisted = await runQuery(`
        SELECT product_id FROM wishlist_items WHERE wishlist_id = ? AND product_id IN (?)
        `, [wishlist_id, ids]);
    const wishlistedSet = new Set(wishlisted.map(r => r.product_id));

    const results = products.map((hit) => ({
        ...hit._source,
        wishlisted: wishlistedSet.has(parseInt(hit._source.id)),
    }));
    
    // const results = products.map(item => item._source)

    // if(results.length === 0){
    //     return {}
    // }

    // await bulkUpdateThumbnails(client, results)
    // await createProductIndex(client);
    // await indexBulkProducts(client, results);

    // const total = results[0].total_filtered;

    if(!total){
        throw new Error ("Could not count total searched products")
    }

    const productsRes = {
        products : results,
        currentPage : page,
        pages: Math.ceil (total / limit),
        total,
        brands
    }
    return productsRes
}

// exports.getSearchedProducts = async (queryParams, userId) => {
//     const {
//         query,
//         page,
//         limit,
//         offset,
//         priceRange,
//         inStock,
//         rating,
//         sortBy // Added for flexible sorting
//     } = queryParams;

//     if (!query || query.trim().length < 1) {
//         return { products: [], totalCount: 0, pages: 0, currentPage: 1 };
//     }

//     const booleanQuery = query
//         .split(/\s+/)
//         .map(word => `+${word}*`)
//         .join(" ");

//     // const params = [booleanQuery, userId, booleanQuery];
//     const params = [query, userId, query];
    
//     // 2. Dynamically build the WHERE clause for the OUTER query
//     let whereClause = '';

//     if (priceRange) {
//         const [from, to] = priceRange.split(",");
//         whereClause += ` AND price >= ? AND (? = '' OR price <= ?) `;
//         params.push(from, to, to);
//     }

//     if (inStock === 'true') {
//         whereClause += ` AND stock > 0`;
//     }

//     if (rating) {
//         whereClause += ` AND rating >= ?`;
//         params.push(rating);
//     }

//     // 3. Dynamically build the ORDER BY clause
//     let orderByClause = 'ORDER BY relevance_score DESC'; // Default sort
//     switch (sortBy) {
//         case 'price_asc':
//             orderByClause = 'ORDER BY price ASC';
//             break;
//         case 'price_desc':
//             orderByClause = 'ORDER BY price DESC';
//             break;
//         case 'rating':
//             orderByClause = 'ORDER BY rating DESC';
//             break;
//     }

//     // 4. Construct the final query string
//     const finalQuery = `
//         SELECT
//             *,
//             COUNT(*) OVER() AS total_filtered
//         FROM (
//             SELECT 
//                 p.id, p.title, p.description, p.rating, p.brand, p.thumbnail, p.status,
//                 c.category, pp.mrp, i.stock,
                
//                 MATCH(p.title, p.description) AGAINST(? IN NATURAL LANGUAGE MODE) AS relevance_score,

//                 CASE 
//                     WHEN pd.offer_price IS NOT NULL THEN pd.offer_price
//                     ELSE pp.price
//                 END AS price,
                
//                 CASE 
//                     WHEN wi.product_id IS NOT NULL THEN TRUE 
//                     ELSE FALSE 
//                 END AS wishlisted
//             FROM 
//                 products p
//                 JOIN product_inventory i ON p.id = i.product_id
//                 JOIN categories c ON c.id = p.category_id
//                 JOIN product_pricing pp ON p.id = pp.product_id AND NOW() BETWEEN pp.start_time AND pp.end_time
//                 LEFT JOIN product_discounts pd ON p.id = pd.product_id AND pd.is_active = 1 AND NOW() BETWEEN IFNULL(pd.start_time, NOW()) AND IFNULL(pd.end_time, NOW())
//                 LEFT JOIN wishlist_items wi ON p.id = wi.product_id AND wi.wishlist_id = (SELECT id FROM wishlists WHERE user_id = ? AND name = 'my_wishlist') 
//             WHERE
//                 p.status = 'active'
//                 AND MATCH(p.title, p.description) AGAINST(? IN NATURAL LANGUAGE MODE)
//         ) AS FilterableProducts
//         WHERE 1=1 ${whereClause}
//         ${orderByClause}
//         LIMIT ? OFFSET ?
//     `;

//     // Add pagination params at the end
//     params.push(limit, offset);

//     const results = await runQuery(finalQuery, params);

//     // The rest of your processing logic remains the same
//     if (results.length === 0) {
//         return { products: [], totalCount: 0, pages: 0, currentPage: 1 };
//     }

//     const total = results[0].total_filtered;

//     const products = results.map(({ total_filtered, ...productData }) => productData);

//     return {
//         products: products,
//         currentPage: page,
//         pages: Math.ceil(total / limit),
//         totalCount: total
//     };
// };


exports.getTrendingProducts = async (limit, userId) => {
    const oneWeekAgo = dayjs().startOf('day').subtract(7, "day").format("YYYY-MM-DD hh:mm:ss")

    const query = `SELECT id FROM orders WHERE order_date BETWEEN ? AND NOW() ORDER BY order_date DESC`

    let orderIds = []
    const oneWeekOrders = await runQuery(query, [oneWeekAgo])
    orderIds = oneWeekOrders.map(order => order.id)

    if(oneWeekOrders.length < 1){
        const oneMonthAgo = dayjs().startOf('day').subtract(1, "month").format("YYYY-MM-DD hh:mm:ss")
        const oneMonthOrders = await runQuery(query, [oneMonthAgo])
        orderIds = oneMonthOrders.map(order => order.id)
    }

    const products = await runQuery(`SELECT product_id, COUNT(product_id) AS count FROM order_item WHERE order_id IN (?) GROUP BY product_id ORDER BY count DESC LIMIT ?`, [orderIds, limit])
    const productIds = products.map(prod => prod.product_id)

    const results = await this.getProductsByIdsHelper(productIds, userId)
    if(results.length === 0){
        throw new Error ("Could not select all products")
    }

    return results
}

exports.getRecentlyOrderedProducts = async (limit, userId) => {
    const orderItems = await runQuery(`SELECT product_id
                                        FROM order_item
                                        GROUP BY product_id
                                        ORDER BY MAX(id) DESC
                                        LIMIT ?`, [limit])
    const productIds = orderItems.map(prod => prod.product_id)

    const results = await this.getProductsByIdsHelper(productIds, userId)
    if(results.length === 0){
        throw new Error ("Could not select all products")
    }

    return results
}

exports.getSingleProduct = async(productId, userId) => {
    const results = await this.getProductsByIdsHelper([productId], userId)

    if(results.length === 0){
        throw new Error ("Failed to fetch product details")
    }
    const product = results[0];

    const images = await runQuery("SELECT image FROM product_images WHERE product_id = ?", [productId])
    if(images.length === 0){
        throw new Error ("Failed to fetch images")
    }
    const imgArr = images.map((item) => item.image);
    product.images = imgArr;
    return product
}

exports.getProductsByIdsHelper = async (productIds, userId = null) => {
    const products = await runQuery(`
    SELECT 
        p.*, 
        c.category,
        pp.mrp, 
        pp.discount, 
        i.stock,
        pd.discount_type,
        CASE 
            WHEN wi.product_id IS NOT NULL 
                THEN true 
            ELSE false 
        END AS wishlisted,
        CASE 
            WHEN pd.offer_price IS NOT NULL 
                THEN ROUND(((pp.mrp - pd.offer_price) / pp.mrp) * 100, 2)
            ELSE NULL
        END AS offer_discount,
        CASE 
            WHEN pd.offer_price IS NOT NULL 
                THEN pd.offer_price
            ELSE pp.price
        END AS price

        FROM products p 
            JOIN product_inventory i 
                ON p.id = i.product_id
            JOIN categories c 
                ON c.id = p.category_id
            JOIN product_pricing pp    
                ON pp.product_id = p.id
                AND p.status = ?
                AND NOW() BETWEEN pp.start_time AND pp.end_time
            LEFT JOIN product_discounts pd
                ON pd.product_id = p.id
                AND pd.is_active = 1
                AND (pd.start_time IS NULL OR pd.start_time <= NOW())
                AND (pd.end_time IS NULL OR pd.end_time > NOW())
            LEFT JOIN wishlist_items wi
                ON p.id = wi.product_id AND wi.wishlist_id = (
                    SELECT id FROM wishlists WHERE user_id = ? AND name = ?
                )
            WHERE p.id IN (?)
            ORDER BY FIELD(p.id, ?)
    `, ["active", userId, "my_wishlist", productIds, productIds]);

    return products
}


function normalizeProducts(products) {
    if (!Array.isArray(products)) {
        throw new Error('Input must be an array');
    }
    
    return products.map(product => {
        const { _id, _source, _score : score } = product;
        
        const normalized = {
            // score: score,
            id: parseInt(_id),
            title: _source.title,
            description: _source.description,
            rating: _source.rating,
            brand: _source.brand,
            thumbnail: _source.thumbnail,
            status: _source.status,
            category: _source.category,
            mrp: _source.mrp,
            stock: _source.stock,
            offer_discount: _source.offer_discount,
            price: _source.price,
            wishlisted: _source.wishlisted ? 1 : 0,
        };
        
        return normalized;
    });
}