const runQuery = require("../db")

exports.addQuantity = async (cartId, productId, userId) => {
    const addItem = await runQuery("SELECT * FROM cart_item WHERE user_id = ? AND product_id = ?", [userId, productId])
    if (addItem.length > 0) {
        const update = await runQuery(
            "UPDATE cart_item SET quantity = quantity + 1 WHERE user_id = ? AND product_id = ?",
            [userId, productId])

        if(update.affectedRows === 0){
            throw new Error("Error Updating Quantity")
        }
    }
    else {
        const insert = await runQuery("INSERT INTO cart_item (cart_id, user_id, product_id, quantity) VALUES (?, ?, ?, 1)",
            [cartId, userId, productId])
        
        if(insert.affectedRows === 0){
            throw new Error("Error Adding to Cart")
        }
    }
}


exports.removeQuantity = async (cartId, productId, userId) => {
    const removeItem = await runQuery("SELECT * FROM cart_item WHERE user_id = ? AND product_id = ?", [userId, productId])
    if(removeItem.length === 0){
        throw new Error("Cart Entry not found")
    }
    const currentQty = removeItem[0].quantity;
    if(currentQty > 1){
    const update = await runQuery(
        "UPDATE cart_item SET quantity = quantity - 1 WHERE cart_id = ? AND user_id = ? AND product_id = ?",
        [cartId, userId, productId])
        if(update.affectedRows === 0){
            throw new Error ("Error updating quantity")
        }
    }
    else {
        const remove = await runQuery("DELETE FROM cart_item WHERE cart_id = ? AND user_id = ? AND product_id = ?",
            [cartId, userId, productId])
        
        if(remove.affectedRows === 0){ 
            throw new Error("Error removing entry")
        }
    }
}