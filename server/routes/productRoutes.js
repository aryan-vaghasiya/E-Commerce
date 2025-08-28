const express = require("express");
const router = express.Router();
// const verifyToken = require("../middlewares/verifyToken");
const productsController = require("../controllers/productsController");

router.get("/", productsController.allProducts);
router.get("/trending", productsController.trendingProducts);
router.get("/recently-ordered", productsController.recentlyOrderedProducts);
router.get("/search", productsController.searchProduct);
router.get("/:id", productsController.singleProduct);

module.exports = router;