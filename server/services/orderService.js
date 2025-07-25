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
        SELECT 
            ?, 
            ci.product_id, 
            ci.quantity, 
            CASE 
                WHEN pd.discount_percentage IS NOT NULL 
                THEN ROUND(pp.mrp - (pp.mrp * pd.discount_percentage / 100), 2)
                ELSE pp.price
            END AS purchase_price

        FROM cart_item ci 
        JOIN product_pricing pp 
            ON ci.product_id = pp.product_id
            AND NOW() BETWEEN pp.start_time AND pp.end_time

        LEFT JOIN product_discounts pd
            ON pd.product_id = ci.product_id
            AND pd.is_active = 1
            AND (pd.start_time IS NULL OR pd.start_time <= NOW())
            AND (pd.end_time IS NULL OR pd.end_time > NOW())
        WHERE ci.user_id = ? AND ci.cart_id = ?
        `,[orderId, userId, cartId]);

    // const insertItem = await runQuery(`
    //     INSERT INTO order_item (order_id, product_id, quantity, purchase_price) 
    //     SELECT 
    //     ?, 
    //     ci.product_id, 
    //     ci.quantity, 
    //     pp.price

    //     FROM cart_item ci 
    //     JOIN product_pricing pp ON ci.product_id = pp.product_id
    //     WHERE ci.user_id = ? AND ci.cart_id = ? AND NOW() BETWEEN pp.start_time AND pp.end_time`,[orderId, userId, cartId]);

    // const insertItem = await runQuery(`
    //     INSERT INTO order_item (order_id, product_id, quantity, purchase_price) 
    //     SELECT ?, ci.product_id, ci.quantity, pp.price 
    //     FROM cart_item ci 
    //     JOIN products p ON ci.product_id = p.id
    //     JOIN product_pricing pp on pp.product_id = p.id
    //     WHERE ci.user_id = ? AND ci.cart_id = ? AND NOW() BETWEEN pp.start_time AND pp.end_time`,[orderId, userId, cartId]);
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
                                        o.total AS cartValue,
                                        o.status
                                    FROM order_item oi 
                                    JOIN products p ON oi.product_id = p.id
                                    JOIN orders o ON oi.order_id = o.id
                                    WHERE o.user_id = ?`, [userId]);
    if(getOrders.length < 0){
        console.error("No Orders Exist");
        return{};
    }
    // console.log(getOrders);

    const grouped = {};
    getOrders.forEach(item => {
        if (!grouped[item.order_id]) {
            grouped[item.order_id] = {
                                        order_id: item.order_id,
                                        noOfItems: 0,
                                        products: [],
                                        cartValue: item.cartValue,
                                        status: item.status
                                    }
        }
        grouped[item.order_id].products.push({
            id: item.id,
            quantity: item.quantity,
            price: item.price,
            title: item.title,
            brand: item.brand,
            thumbnail: item.thumbnail,
            rating: item.rating
        });
        grouped[item.order_id].noOfItems += item.quantity;
    });

    const orders = Object.values(grouped);
    // console.log(orders);
    
    return orders;
}