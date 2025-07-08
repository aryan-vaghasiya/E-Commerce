const runQuery = require("../db")

exports.addOrder = async(userId) => {
    const checkCart = await runQuery("SELECT * FROM cart WHERE user_id = ? AND status = 'active'", [userId]);
    if (checkCart.length === 0) {
        throw new Error("No active cart found");
    }
    const cartId = checkCart[0].id; 

    const itemsToOrder = await runQuery(
        `SELECT ci.product_id, ci.quantity
        FROM cart_item ci
        WHERE ci.user_id = ? AND ci.cart_id = ?`, [userId, cartId]);

    for (const item of itemsToOrder) {
        const [checkStock] = await runQuery(`SELECT stock FROM product_inventory WHERE product_id =?`, [item.product_id]);
        // console.log(checkStock);

        if (!checkStock || checkStock.stock === undefined) {
            throw new Error(`Inventory not found for Product ID: ${item.product_id}`);
        }

        if(checkStock.stock < item.quantity){
            throw new Error(`Insufficient stock for Product ID: ${item.product_id}`)
        }
    }

    for (const item of itemsToOrder) {
        const updateStock = await runQuery(
            `UPDATE product_inventory SET stock = stock - ? WHERE product_id = ?`, [item.quantity, item.product_id]
        )
        
        if(updateStock.affectedRows === 0){
            throw new Error(`Could not Update Quantity for Product ID: ${item.product_id}`)
        }
    }

    const insert = await runQuery("INSERT INTO orders (user_id, total) VALUES (?, 0)", [userId]);
    if (insert.affectedRows === 0) {
        throw new Error("Couldn't insert Order");
    }
    const orderId = insert.insertId;

    const insertItem = await runQuery(`
        INSERT INTO order_item (order_id, product_id, quantity, purchase_price) 
        SELECT ?, ci.product_id, ci.quantity, p.price 
        FROM cart_item ci 
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

exports.getOrdersService = async (userId) => {
    const getOrders = await runQuery(`SELECT 
                                        oi.order_id, 
                                        oi.product_id AS id, 
                                        oi.quantity, 
                                        oi.purchase_price AS price, 
                                        p.title, 
                                        p.description, 
                                        p.rating, 
                                        p.brand, 
                                        p.thumbnail, 
                                        o.total AS cartValue 
                                    FROM order_item oi 
                                    JOIN products p ON oi.product_id = p.id
                                    JOIN orders o ON oi.order_id = o.id
                                    WHERE o.user_id = ?`, [userId]);
    if(getOrders.length < 0){
        console.error("No Orders Exist");
        return{};
    }

    const grouped = {};
    getOrders.forEach(item => {
        if (!grouped[item.order_id]) {
            grouped[item.order_id] = {
                                        order_id: item.order_id,
                                        noOfItems: 0,
                                        products: [],
                                        cartValue: item.cartValue,
                                    }
        }
        grouped[item.order_id].products.push({
            id: item.id,
            quantity: item.quantity,
            price: item.price,
            title: item.title,
            brand: item.brand,
            thumbnail: item.thumbnail
        });
        grouped[item.order_id].noOfItems += item.quantity;
    });

    const orders = Object.values(grouped);
    return orders;
}