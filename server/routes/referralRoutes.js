const express = require("express");
const router = express.Router();
// const verifyToken = require("../middlewares/verifyToken");
const userController = require("../controllers/userController");

// router.get("/", productsController.allProducts);
// router.get("/trending", productsController.trendingProducts);
// router.get("/recently-ordered", productsController.recentlyOrderedProducts);
// router.get("/search", productsController.searchProduct);
router.post("/generate", userController.makeReferralToken);
router.post("/send-invite", userController.sendReferralInvite);

module.exports = router;