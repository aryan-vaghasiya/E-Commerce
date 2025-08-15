const runQuery = require("../db")

exports.orderedItemsProductCoupon = async (couponId, orderIds) => {
    const orderItems = await runQuery(`SELECT
                                oi.product_id,
                                SUM(oi.quantity) AS total_quantity,
                                SUM(oi.purchase_price * oi.quantity) AS total_purchase_price
                            FROM order_item oi
                            JOIN (
                                SELECT DISTINCT product_id 
                                FROM coupon_products    
                                WHERE coupon_id = ?
                            ) cp 
                                ON oi.product_id = cp.product_id
                            WHERE oi.order_id IN (?)
                            GROUP BY oi.product_id`, [couponId, orderIds]);

    // if(orderItems.length === 0){
    //     throw new Error ("No orders for this coupon yet")
    // }
    return orderItems
}

exports.orderedItemsCategoryCoupon = async (couponId, orderIds) => {
    const orderItems = await runQuery(`SELECT 
                                        oi.product_id,
                                        SUM(oi.quantity) AS total_quantity,
                                        SUM(oi.purchase_price * oi.quantity) AS total_purchase_price
                                    FROM order_item oi
                                    JOIN products p 
                                        ON oi.product_id = p.id
                                    JOIN (
                                        SELECT DISTINCT category_id 
                                        FROM coupon_categories    
                                        WHERE coupon_id = ?
                                    ) cc
                                        ON cc.category_id = p.category_id
                                    WHERE oi.order_id IN (?)
                                    GROUP BY oi.product_id`, [couponId, orderIds]);

    return orderItems
}