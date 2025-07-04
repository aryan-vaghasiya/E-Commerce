const runQuery = require("../db")

exports.addOrder = async(userId) => {
    const checkCart = await runQuery("SELECT * FROM cart WHERE user_id = ? AND status = 'active'", [userId]);
    if (checkCart.length === 0) {
        throw new Error("No active cart found");
    }
    const cartId = checkCart[0].id;

    const insert = await runQuery("INSERT INTO orders (user_id, total) VALUES (?, 0)", [userId]);
    if (insert.affectedRows === 0) {
        throw new Error("Couldn't insert Order");
    }
    const orderId = insert.insertId;

    const insertItem = await runQuery(`INSERT INTO order_item 
        (order_id, product_id, quantity, purchase_price) 
        SELECT ?, ci.product_id, ci.quantity, p.price FROM cart_item ci 
        JOIN products p ON ci.product_id = p.id 
        WHERE ci.user_id = ? AND ci.cart_id = ?`,[orderId, userId, cartId]);
    if (insertItem.affectedRows === 0) {
        throw new Error("Couldn't insert Order Item");
    }

    const setTotal = await runQuery(`UPDATE orders
            SET total = (
                SELECT SUM(quantity * purchase_price)
                FROM order_item
                WHERE order_id = ?
            )
            WHERE id = ?`,
        [orderId, orderId]);
    if (setTotal.affectedRows === 0) {
        throw new Error("Couldn't update Total");
    }

    const emptyCart = await runQuery(`DELETE FROM cart_item WHERE cart_id = ?`, [cartId])
    if (emptyCart.affectedRows === 0) {
        throw new Error("Couldn't empty Cart");
    }
}