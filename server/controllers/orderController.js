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