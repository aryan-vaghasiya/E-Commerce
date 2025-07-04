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


exports.getCartService = async(userId) => {
    const getCart = await runQuery(`SELECT 
                                        ci.product_id AS id,
                                        ci.quantity,
                                        p.title,
                                        p.description,
                                        p.price,
                                        p.rating,
                                        p.brand,
                                        p.thumbnail
                                    FROM cart_item ci JOIN products p ON ci.product_id = p.id
                                    WHERE ci.user_id = ?`, [userId]);
    if(getCart.length < 0){
        console.error("No cart items Exist");
        return{};
    }
    return getCart;
}