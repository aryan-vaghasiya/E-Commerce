const express = require("express");
const router = express.Router();
// const verifyToken = require("../middlewares/verifyToken");
const wishlistController = require("../controllers/wishlistController");

router.post("/add", wishlistController.addWishlistItem);
// router.post("/remove", );
// router.get("/get-cart", cartController.getCartItems);

module.exports = router;