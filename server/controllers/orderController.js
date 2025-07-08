const orderService = require("../services/orderService")

exports.getOrders = async (req, res) => {
    const userId = req.user.id;

    try{
        const ordersData = await orderService.getOrdersService(userId);
        return res.status(200).json(ordersData);
    }
    catch(err){
        res.status(503).json({error : err.message});
    }
}

exports.addToOrders = async (req, res) => {
    const userId = req.user.id;
    try{
        await orderService.addOrder(userId);
        res.status(200).json({ message: "Order placed successfully"});
    }
    catch(err){
        console.error("Error in addToOrders:", err.message);
        res.status(500).json({ error: err.message });
    }
}