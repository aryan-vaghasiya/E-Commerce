const runQuery = require("../db");
const dayjs = require("dayjs");

exports.getAllProducts = async(page, limit, offset) => {
    const results = await runQuery(`SELECT 
        p.*, 
        c.category,
        pp.mrp, 
        pp.discount, 
        i.stock,

        pd.discount_type,
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
            LIMIT ? OFFSET ?`, ["active", limit, offset]);
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

exports.getSearchedProducts = async (page, limit, offset, query) => {
    const status = "active"
    const results = await runQuery(`SELECT 
        p.*, 
        c.category,
        pp.mrp, 
        pp.discount, 
        i.stock,
        pd.discount_type,
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
        JOIN product_inventory i ON p.id = i.product_id 
        JOIN categories c ON c.id = p.category_id
        JOIN product_pricing pp ON pp.product_id = p.id 
            AND NOW() BETWEEN pp.start_time AND pp.end_time
        LEFT JOIN product_discounts pd ON pd.product_id = p.id
            AND pd.is_active = 1
            AND (pd.start_time IS NULL OR pd.start_time <= NOW())
            AND (pd.end_time IS NULL OR pd.end_time > NOW())

        WHERE (p.title LIKE CONCAT('%', ?, '%') OR p.description LIKE CONCAT('%', ?, '%'))
        AND p.status = ? 
        LIMIT ? OFFSET ?`, [query, query, "active", limit, offset]);
    if(results.length === 0){
        // throw new Error ("Could not select searched products")
        return {}
    }

    const [{total}] = await runQuery("SELECT COUNT(*) as total FROM products WHERE title LIKE CONCAT('%', ?, '%') OR description LIKE CONCAT('%', ?, '%')", [query, query])
    if(!total){
        throw new Error ("Could not count total searched products")
    }

    const productsRes = {
        products : results,
        currentPage : page,
        pages: Math.ceil (total / limit),
        total
    }
    return productsRes
}

exports.getTrendingProducts = async (limit) => {
    const oneWeekAgo = dayjs().startOf('day').subtract(7, "day").format("YYYY-MM-DD hh:mm:ss")

    const oneWeekOrders = await runQuery(`SELECT id FROM orders WHERE order_date BETWEEN ? AND NOW() ORDER BY order_date DESC`, [oneWeekAgo])
    const orderIds = oneWeekOrders.map(order => order.id)

    const products = await runQuery(`SELECT product_id, COUNT(product_id) AS count FROM order_item WHERE order_id IN (?) GROUP BY product_id ORDER BY count DESC LIMIT ?`, [orderIds, limit])
    const productIds = products.map(prod => prod.product_id)

    const results = await this.getProductsByIdsHelper(productIds)
    if(results.length === 0){
        throw new Error ("Could not select all products")
    }

    return results
}

exports.getRecentlyOrderedProducts = async (limit) => {
    const orderItems = await runQuery(`SELECT product_id
                                        FROM order_item
                                        GROUP BY product_id
                                        ORDER BY MAX(id) DESC
                                        LIMIT ?`, [limit])
    const productIds = orderItems.map(prod => prod.product_id)

    const results = await this.getProductsByIdsHelper(productIds)
    if(results.length === 0){
        throw new Error ("Could not select all products")
    }

    return results
}

exports.getSingleProduct = async(productId) => {
    const results = await runQuery(`SELECT 
                                        p.*,
                                        c.category,
                                        pp.mrp, 
                                        pp.discount, 
                                        i.stock,
                                        pd.discount_type,
                                        pd.start_time,
                                        pd.end_time,
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
                                        AND p.id = ? 
                                        AND NOW() BETWEEN pp.start_time AND pp.end_time
                                    LEFT JOIN product_discounts pd ON pd.product_id = p.id
                                        AND pd.is_active = 1
                                        AND (pd.start_time IS NULL OR pd.start_time <= NOW())
                                        AND (pd.end_time IS NULL OR pd.end_time > NOW())
                                    `, [productId]);
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

exports.getProductsByIdsHelper = async (productIds) => {
    const products = await runQuery(`SELECT 
        p.*, 
        c.category,
        pp.mrp, 
        pp.discount, 
        i.stock,
        pd.discount_type,
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
            WHERE p.id IN (?)
            ORDER BY FIELD(p.id, ?)`, ["active", productIds, productIds]);

    return products
}