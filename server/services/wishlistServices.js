const runQuery = require("../db")

exports.addWishlistService = async (productId, userId) => {
    const result = runQuery('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)', [userId, productId])
    if(result.affectedRows === 0){
        throw new Error("Could not add Wishlist Item")
    }
}

exports.removeWishlistService = async (productId, userId) => {
    const result = runQuery('DELETE FROM wishlist WHERE user_id =? AND product_id = ?', [userId, productId])
    if(result.affectedRows === 0){
        throw new Error("Could not remove Wishlist Item")
    }
}

exports.getWishlistService = async(userId) => {
    const getCart = await runQuery(`SELECT 
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
                                    FROM wishlist wi 
                                    JOIN products p ON wi.product_id = p.id
                                    JOIN product_pricing pp on pp.product_id = p.id
                                    AND wi.user_id = ? 
                                    AND NOW() BETWEEN pp.start_time AND pp.end_time
                                            LEFT JOIN product_discounts pd
                                    ON pd.product_id = p.id
                                    AND pd.is_active = 1
                                    AND (pd.start_time IS NULL OR pd.start_time <= NOW())
                                    AND (pd.end_time IS NULL OR pd.end_time > NOW())
                                    ORDER BY wi.id`, [userId]);
    // console.log(getCart);
    if(getCart.length < 0){
        console.error("No wishlist items Exist");
        return{};
    }
    return getCart;
}