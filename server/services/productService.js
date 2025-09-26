const runQuery = require("../db");
const dayjs = require("dayjs");

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
        priceRange
    } = queryParams

    console.log(priceRange);

    if(query.trim().length < 1){
        return {}
    }

    const whereClause = ` WHERE  (title LIKE CONCAT('%', ?, '%') OR description LIKE CONCAT('%', ?, '%'))`
    const params = [query, query]

    if(priceRange){
        const rangeArr = priceRange.split(",")
        console.log(rangeArr);

        whereClause += ` AND `
    }

//     SELECT
//     *
// FROM (
//     -- Start of Inner Query: Gather all product data and calculate dynamic fields
//     SELECT 
//         p.id,
//         p.title,
//         p.description,
//         p.rating,
//         p.brand,
//         p.thumbnail,
//         p.status,
//         c.category,
//         pp.mrp, 
//         i.stock,
        
//         -- Calculate the final price, considering special offers
//         CASE 
//             WHEN pd.offer_price IS NOT NULL THEN pd.offer_price
//             ELSE pp.price
//         END AS final_price,
        
//         -- Determine if the product is wishlisted for the given user
//         CASE 
//             WHEN wi.product_id IS NOT NULL THEN TRUE 
//             ELSE FALSE 
//         END AS wishlisted

//     FROM 
//         products p
//     JOIN 
//         product_inventory i ON p.id = i.product_id
//     JOIN 
//         categories c ON c.id = p.category_id
//     JOIN 
//         product_pricing pp ON p.id = pp.product_id 
//         AND NOW() BETWEEN pp.start_time AND pp.end_time -- Get current base pricing
//     LEFT JOIN 
//         product_discounts pd ON p.id = pd.product_id 
//         AND pd.is_active = 1 
//         AND NOW() BETWEEN IFNULL(pd.start_time, NOW()) AND IFNULL(pd.end_time, NOW()) -- Get current promotional discounts
//     LEFT JOIN 
//         wishlist_items wi ON p.id = wi.product_id 
//         AND wi.wishlist_id = (SELECT id FROM wishlists WHERE user_id = ? AND name = 'my_wishlist') -- User ID for wishlist check
    
//     WHERE
//         p.status = 'active'
//     -- End of Inner Query
// ) AS FilterableProducts
// WHERE
//     -- Apply all filters to the results of the inner query
//     (title LIKE ? OR description LIKE ?) -- Text query
//     AND (final_price BETWEEN ? AND ?)      -- Price range filter
//     -- AND (brand IN (?))                  -- Example: Brand filter
//     -- AND (rating >= ?)                    -- Example: Rating filter
// ORDER BY 
//     rating DESC -- Or final_price ASC, etc.
// LIMIT ? OFFSET ?; -- Apply pagination at the very end

    const products = await runQuery(`SELECT id FROM products WHERE (title LIKE CONCAT('%', ?, '%') OR description LIKE CONCAT('%', ?, '%')) LIMIT ? OFFSET ?`, [query, query, limit, offset])
    const productIds = products.map(item => item.id)

    if(productIds.length === 0){
        return {}
    }

    const results = await this.getProductsByIdsHelper(productIds, userId)

    if(results.length === 0){
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

exports.getTrendingProducts = async (limit, userId) => {
    const oneWeekAgo = dayjs().startOf('day').subtract(7, "day").format("YYYY-MM-DD hh:mm:ss")

    const oneWeekOrders = await runQuery(`SELECT id FROM orders WHERE order_date BETWEEN ? AND NOW() ORDER BY order_date DESC`, [oneWeekAgo])
    const orderIds = oneWeekOrders.map(order => order.id)

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