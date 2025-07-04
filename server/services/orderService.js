const runQuery = require("../db")

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