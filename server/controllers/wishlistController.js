const wishlistService = require("../services/wishlistServices")
const cartService = require("../services/cartService")

exports.addWishlistItem = async (req, res) => {
    const productId = req.body.productId
    const userId = req.user.id;

    try{
        await wishlistService.addWishlistService(productId, userId)
        res.status(200).json({ message: "Wishlist Item added"});
    }
    catch(err){
        console.error("Error Adding Wishlist Item: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.removeWishlistItem = async (req, res) => {
    const productId = req.body.productId
    const userId = req.user.id;
    const name = req.body.name || "my_wishlist"

    try{
        await wishlistService.removeWishlistService(productId, userId, name)
        res.status(200).json({ message: "Wishlist Item removed"});
    }
    catch(err){
        console.error("Error Removing Wishlist Item: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.getAllWishlist = async (req, res) => {
    const userId = req.user.id;

    try{
        const result = await wishlistService.getWishlistService(userId)
        res.status(200).json(result);
    }
    catch(err){
        console.error("Error Fetching Wishlist Items: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.addSaveForLater = async (req, res) => {
    const productId = req.body.productId
    const userId = req.user.id;
    console.log(req.body);

    try{
        await cartService.removeCartItemService(productId, userId)
        await wishlistService.addWishlistService(productId, userId, "save_for_later")
        res.status(200).json({ message: "Item Saved For Later"});
    }
    catch(err){
        console.error("Error Saving for later: ", err.message);
        res.status(500).json({ error: err.message });
    }
}