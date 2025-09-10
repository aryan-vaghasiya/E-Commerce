const express = require("express");
const router = express.Router();
const optionalVerifyToken = require("../middlewares/optionalVerifyToken");
const productsController = require("../controllers/productsController");

router.get("/", optionalVerifyToken, productsController.allProducts);
router.get("/trending", optionalVerifyToken, productsController.trendingProducts);
router.get("/recently-ordered", optionalVerifyToken, productsController.recentlyOrderedProducts);
router.get("/search", optionalVerifyToken, productsController.searchProduct);
router.get("/:id", optionalVerifyToken, productsController.singleProduct);

module.exports = router;