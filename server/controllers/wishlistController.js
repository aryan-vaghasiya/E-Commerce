const wishlistService = require("../services/wishlistServices")

exports.addWishlistItem = async (req, res) => {
    // console.log(req.body);
    const productId = req.body.productId
    const userId = req.user.id;
    // console.log(productId, userId);
    // console.log(id);
    
    try{
        const result = await wishlistService.addWishlistService(productId, userId)
        res.status(200).json({ message: "Wishlist Item added"});
    }
    catch(err){
        console.error("Error Adding Wishlist Item: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.removeWishlistItem = async (req, res) => {
    // console.log(req.body);
    const productId = req.body.productId
    const userId = req.user.id;
    // console.log(productId, userId);
    // console.log(id);
    
    try{
        const result = await wishlistService.removeWishlistService(productId, userId)
        res.status(200).json({ message: "Wishlist Item removed"});
    }
    catch(err){
        console.error("Error Removing Wishlist Item: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.getAllWishlist = async (req, res) => {
    // console.log(req.body);
    // const productId = req.body.productId
    const userId = req.user.id;
    // console.log(productId, userId);
    // console.log(id);
    
    try{
        const result = await wishlistService.getWishlistService(userId)
        res.status(200).json(result);
    }
    catch(err){
        console.error("Error Fetching Wishlist Items: ", err.message);
        res.status(500).json({ error: err.message });
    }
}