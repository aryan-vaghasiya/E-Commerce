const runQuery = require("../db")

exports.addWishlistService = async (productId, userId, name = "my_wishlist") => {
    const upsert = await runQuery(
        `INSERT INTO wishlists (user_id, name)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
        [userId, name]
    );
    const wishlistId = upsert.insertId;

    if(!upsert.insertId){
        throw err;
    }

    const addItem = await runQuery(
        `INSERT INTO wishlist_items (wishlist_id, product_id)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE added_at = CURRENT_TIMESTAMP`,
        [wishlistId, productId]
    );

    if(!addItem.affectedRows){
        throw err;
    }
}

exports.removeWishlistService = async (productId, userId, name = "my_wishlist") => {
    const result = await runQuery(
        `DELETE wi
            FROM wishlist_items wi
            JOIN wishlists w ON wi.wishlist_id = w.id
            WHERE w.user_id = ? AND w.name = ? AND wi.product_id = ?`,
        [userId, name, productId]
    );

    if (result.affectedRows === 0) {
        throw err;
    }
}

exports.getWishlistService = async(userId, name = "my_wishlist") => {

    const [{noOfItems}] = await runQuery(`
        SELECT 
            COUNT(wi.product_id) AS noOfItems
        FROM wishlists w 
        JOIN wishlist_items wi 
            ON w.id = wi.wishlist_id 
        WHERE w.user_id = ?
            AND w.name = ?
        `, [userId, "my_wishlist"])

    // console.log(noOfItems);

    const getItems = await runQuery(`SELECT 
                                        ws.id as wishlistId,
                                        ws.name as wishlistName,
                                        wi.product_id AS id,
                                        p.title,
                                        p.description,
                                        pd.discount_type,
                                        pp.discount,
                                        CASE  
                                            WHEN pd.offer_price IS NOT NULL 
                                                THEN ROUND(((pp.mrp - pd.offer_price) / pp.mrp) * 100, 2)
                                            ELSE NULL
                                        END AS offer_discount,
                                        CASE 
                                            WHEN pd.offer_price IS NOT NULL 
                                                THEN pd.offer_price
                                            ELSE pp.price
                                        END AS price,
                                        p.rating,
                                        p.brand,
                                        p.thumbnail
                                    FROM wishlists ws
                                    JOIN wishlist_items wi
                                        ON ws.id = wi.wishlist_id
                                    JOIN products p 
                                        ON wi.product_id = p.id
                                    JOIN product_pricing pp 
                                        ON pp.product_id = p.id
                                        AND NOW() BETWEEN pp.start_time 
                                        AND pp.end_time
                                    LEFT JOIN product_discounts pd
                                        ON pd.product_id = p.id
                                        AND pd.is_active = ?
                                        AND (pd.start_time IS NULL OR pd.start_time <= NOW())
                                        AND (pd.end_time IS NULL OR pd.end_time > NOW())
                                    WHERE ws.user_id = ? 
                                        AND ws.name = ?
                                    ORDER BY wi.added_at DESC`, [1, userId, name]);

    if(getItems.length <= 0){
        console.error("No wishlist items Exist");
        return[];
    }
    return {noOfItems, items: getItems };
}