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

exports.checkCoupon = async (req, res) => {
    const userId = req.user.id;
    const code = req.body.code.toLowerCase();

    // console.log(code);
    // console.log(userId);
    try{
        const result = await orderService.checkCouponCode(userId, code)
        return res.status(200).json(result);
    }
    catch(err){
        console.error("Error in checkCoupon:", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.addToOrders = async (req, res) => {
    const userId = req.user.id;
    const {order} = req.body;
    const {coupon} = req.body;
    // console.log(coupon);
    
    // console.log(req.body);

    try{
        await orderService.addOrder(userId, order, coupon);
        res.status(200).json({ message: "Order placed successfully"});
    }
    catch(err){
        console.error("Error in addToOrders:", err.message);
        res.status(500).json({ error: err.message });
    }
}