const express = require("express");
const router = express.Router();
// const verifyToken = require("../middlewares/verifyToken");
const wishlistController = require("../controllers/wishlistController");

router.post("/add", wishlistController.addWishlistItem);
router.post("/remove", wishlistController.removeWishlistItem);
router.get("/get-wishlist", wishlistController.getAllWishlist);

module.exports = router;