const checkoutService = require("../services/checkoutService")

exports.addToOrders = async (req, res) => {
    const userId = req.user.id;
    try{
        await checkoutService.addOrder(userId);
        res.status(200).json({ message: "Order placed successfully"});
    }
    catch(err){
        console.error("Error in addToOrders:", err.message);
        res.status(500).json({ error: err.message });
    }
}