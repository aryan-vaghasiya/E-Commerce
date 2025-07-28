const runQuery = require("../db");

exports.getAllProducts = async(page, limit, offset) => {
    const status = "active"
    const results = await runQuery(`SELECT 
        p.*, 
        pp.mrp, 
        pp.discount, 
        i.stock,

        pd.discount_type,
        pd.discount_percentage as offer_discount,
        CASE 
            WHEN pd.discount_percentage IS NOT NULL 
            THEN ROUND(pp.mrp - (pp.mrp * pd.discount_percentage / 100), 2)
            ELSE pp.price
        END AS price

        FROM products p 
        JOIN product_inventory i ON p.id = i.product_id
        JOIN product_pricing pp ON pp.product_id = p.id
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
        pp.mrp, 
        pp.discount, 
        i.stock,
        pd.discount_type,
        pd.discount_percentage as offer_discount,
        CASE 
            WHEN pd.discount_percentage IS NOT NULL 
            THEN ROUND(pp.mrp - (pp.mrp * pd.discount_percentage / 100), 2)
            ELSE pp.price
        END AS price

        FROM products p 
        JOIN product_inventory i ON p.id = i.product_id 
        JOIN product_pricing pp ON pp.product_id = p.id 
            AND NOW() BETWEEN pp.start_time AND pp.end_time
        LEFT JOIN product_discounts pd ON pd.product_id = p.id
            AND pd.is_active = 1
            AND (pd.start_time IS NULL OR pd.start_time <= NOW())
            AND (pd.end_time IS NULL OR pd.end_time > NOW())

        WHERE (p.title LIKE CONCAT('%', ?, '%') OR p.description LIKE CONCAT('%', ?, '%'))
        AND p.status = ? 
        LIMIT ? OFFSET ?`, [query, query,"active", limit, offset]);
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


exports.getSingleProduct = async(productId) => {
    const results = await runQuery(`SELECT 
                                        p.*,
                                        pp.mrp, 
                                        pp.discount, 
                                        i.stock,
                                        pd.discount_type,
                                        pd.discount_percentage as offer_discount,
                                        CASE 
                                            WHEN pd.discount_percentage IS NOT NULL 
                                                THEN ROUND(pp.mrp - (pp.mrp * pd.discount_percentage / 100), 2)
                                            ELSE pp.price
                                        END AS price
                                    FROM products p 
                                    JOIN product_inventory i 
                                        ON p.id = i.product_id 
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