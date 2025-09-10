const runQuery = require("../db")

exports.addWishlistService = async (productId, userId, name = "My Wishlist") => {
    // const result = runQuery('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)', [userId, productId])
    // if(result.affectedRows === 0){
    //     throw new Error("Could not add Wishlist Item")
    // }


    // const wishlist = await runQuery(`SELECT id FROM wishlists WHERE user_id = ? AND name = ?`, [userId, name])
    // let wishlistId
    // if(wishlist.length === 0){
    //     const addWishlist = await runQuery(`INSERT INTO wishlists (user_id, name) VALUES (?, ?)`, [userId, name])
    //     if(addWishlist.affectedRows === 0){
    //         throw new Error ("Could not create wishlist")
    //     }
    //     wishlistId = addWishlist.insertId
    // }
    // else{
    //     wishlistId = wishlist[0].id
    // }

    // try{
    //     const addItem = await runQuery(`INSERT INTO wishlist_items (wishlist_id, product_id) VALUES(?, ?)`, [wishlistId, productId])
    //     if(addItem.affectedRows === 0){
    //         throw new Error("Could not add wishlist item")
    //     }
    // }
    // catch(err){
    //     if (err.code === "ER_DUP_ENTRY") {
    //         throw new Error("Product already exists in wishlist");
    //     }
    //     throw err;
    // }

    // 1) Get or create wishlist in one round-trip
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

    // 2) Add item, tolerate duplicates
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

exports.removeWishlistService = async (productId, userId, name = "My Wishlist") => {
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

exports.getWishlistService = async(userId) => {

    // const getAllWishlists = 

    const getCart = await runQuery(`SELECT 
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
                                        AND ws.user_id = ? 
                                        AND NOW() BETWEEN pp.start_time 
                                        AND pp.end_time
                                    LEFT JOIN product_discounts pd
                                        ON pd.product_id = p.id
                                        AND pd.is_active = 1
                                        AND (pd.start_time IS NULL OR pd.start_time <= NOW())
                                        AND (pd.end_time IS NULL OR pd.end_time > NOW())
                                    ORDER BY wi.id`, [userId]);

    if(getCart.length < 0){
        console.error("No wishlist items Exist");
        return{};
    }
    return getCart;
}