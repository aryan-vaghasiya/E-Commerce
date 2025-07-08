const express = require("express");
const router = express.Router();
// const verifyToken = require("../middlewares/verifyToken");
const cartController = require("../controllers/cartController");

router.post("/add", cartController.addToCart);
router.post("/remove", cartController.removeFromCart);
router.post("/remove-item", cartController.removeCartItem);
router.get("/get-cart", cartController.getCartItems);

module.exports = router;