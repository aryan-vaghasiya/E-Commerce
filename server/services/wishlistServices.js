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
                                        pp.price,
                                        p.rating,
                                        p.brand,
                                        p.thumbnail
                                    FROM wishlist wi 
                                    JOIN products p ON wi.product_id = p.id
                                    JOIN product_pricing pp on pp.product_id = p.id
                                    WHERE wi.user_id = ? AND NOW() BETWEEN pp.start_time AND pp.end_time
                                    ORDER BY wi.id`, [userId]);
    // console.log(getCart);
    if(getCart.length < 0){
        console.error("No wishlist items Exist");
        return{};
    }
    return getCart;
}