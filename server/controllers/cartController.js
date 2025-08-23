const cartService = require("../services/cartService")

exports.addToCart = async (req, res) => {
    const { productId } = req.body;
    const userId = req.user.id;

    try{
        await cartService.addCartService(productId, userId);
        res.status(200).json({ message: "Item added successfully"});
    }
    catch(err){
        console.error("Add to cart failed:", err.message);
        res.status(501).json({error : err.message});
    }
}

exports.addToCartBulk = async (req, res) => {
    const userId = req.user.id;
    const { items } = req.body;

    try{
        // await cartService.addCartService(productId, userId);
        await cartService.addCartBulkService(userId, items);
        res.status(200).json({ message: "Items added successfully"});
    }
    catch(err){
        console.error("Bulk add to cart failed:", err.message);
        res.status(501).json({error : err.message});
    }
}

exports.removeFromCart = async (req, res) => {
    const { productId } = req.body;
    const userId = req.user.id;

    try{
        await cartService.removeCartService(productId, userId)
        return res.status(200).send("Removed from Cart");
    }
    catch(err){
        console.error("Remove from cart failed:", err.message);
        res.status(502).json({error : err.message});
    }
}

exports.removeCartItem = async (req, res) => {
    const { productId } = req.body;
    const userId = req.user.id;

    try{
        await cartService.removeCartItemService(productId, userId)
        return res.status(200).send("Removed Item from Cart");
    }
    catch(err){
        console.error("Removing cart item failed:", err.message);
        res.status(502).json({error : err.message});
    }
}

exports.getCartItems = async (req, res) => {
    const userId = req.user.id;

    try{
        const cartData = await cartService.getCartService(userId);
        return res.status(200).json(cartData);
    }
    catch(err){
        console.error("Fetching from cart failed:", err.message);
        res.status(503).json({error : err.message});
    }
}