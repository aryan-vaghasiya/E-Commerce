const runQuery = require("../db")
const cartUtils = require("../utils/cartUtils")

exports.addCartService = async (productId, userId) => {
    let cartId;

    const checkResult = await runQuery("SELECT id FROM cart WHERE user_id = ? AND status = 'active'",[userId])
    if (checkResult.length > 0) {
        cartId = checkResult[0].id;
        // console.log(checkResult);
        await cartUtils.addQuantity(cartId, productId, userId);
    } 
    else {
        const addResult = await runQuery("INSERT INTO cart (user_id, status) VALUES (?, 'active')", [userId])
        if(addResult.affectedRows === 0){
            throw new Error("Error Adding Cart")
        }
        cartId = addResult.insertId;
        await cartUtils.addQuantity(cartId, productId, userId);
    }
}

exports.removeCartService = async (productId, userId) => {
    const checkResult = await runQuery("SELECT id FROM cart WHERE user_id = ? AND status = 'active'", [userId])
    if (checkResult.length === 0) {
        throw new Error("Entry not found in Cart")
    } 
    const cartId = checkResult[0].id;
    await cartUtils.removeQuantity(cartId, productId, userId)
}

exports.removeCartItemService = async (productId, userId) => {
    const checkResult = await runQuery("SELECT id FROM cart WHERE user_id = ? AND status = 'active'", [userId])
    if (checkResult.length === 0) {
        throw new Error("Entry not found in Cart")
    }
    const cartId = checkResult[0].id;
    const remove = await runQuery("DELETE FROM cart_item WHERE cart_id = ? AND user_id = ? AND product_id = ?",
        [cartId, userId, productId])
    
    if(remove.affectedRows === 0){ 
        throw new Error("Error removing entry")
    }
}

exports.getCartService = async(userId) => {
    const getCart = await runQuery(`SELECT 
                                        ci.product_id AS id,
                                        ci.quantity,
                                        p.title,
                                        p.description,
                                        pp.discount,
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
                                        END AS price,
                                        pp.mrp,
                                        pp.discount,
                                        p.rating, 
                                        p.status,
                                        pi.stock,
                                        p.brand,
                                        p.thumbnail,
                                        c.category
									FROM products p JOIN product_inventory pi ON p.id = pi.product_id
                                    JOIN cart_item ci 
                                        ON p.id = ci.product_id
                                    JOIN categories c
                                        ON c.id = p.category_id
                                    JOIN product_pricing pp 
                                        ON pp.product_id = p.id
                                        AND ci.user_id = ? 
                                        AND NOW() BETWEEN pp.start_time AND pp.end_time
                                    LEFT JOIN product_discounts pd ON pd.product_id = p.id
                                        AND pd.is_active = 1
                                        AND (pd.start_time IS NULL OR pd.start_time <= NOW())
                                        AND (pd.end_time IS NULL OR pd.end_time > NOW())
                                    `, [userId]);
                                    // WHERE ci.user_id = ? AND p.status = ?`, [userId, "active"]);
    // `SELECT 
    //     ci.product_id AS id,
    //     ci.quantity,
    //     p.title,
    //     p.description,
    //     p.price,
    //     p.rating,
    //     p.brand,
    //     p.thumbnail
    // FROM cart_item ci JOIN products p ON ci.product_id = p.id
    // WHERE ci.user_id = ?`
    if(getCart.length < 0){
        console.error("No cart items Exist");
        return{};
    }
    return getCart;
}