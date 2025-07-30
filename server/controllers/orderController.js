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
        const errorsToShow = ["This coupon does not exist", 
                                "This coupon has reached its usage limit and is no longer valid", 
                                "You've already used this coupon the maximum number of times",
                                "Your cart seems to be empty or inactive. Please add items and try again",
                                "This coupon is not applicable to any of the products in your cart",
                                "Insufficiant Cart Value",
                                "Coupon applicable for First Order only"
                            ]
        console.error("Error in checkCoupon:", err.message);
        if(errorsToShow.includes(err.message)){
            return res.status(501).json({ error: err.message });
        }
        return res.status(500).json({ error: err.message });
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