const express = require("express");
const router = express.Router();
// const verifyToken = require("../middlewares/verifyToken");
const walletController = require("../controllers/walletController");

// router.post("/add", wishlistController.addWishlistItem);
// router.post("/remove", wishlistController.removeWishlistItem);
router.get("/get-wallet", walletController.getMyWallet);

module.exports = router;