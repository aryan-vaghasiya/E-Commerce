const express = require("express");
const router = express.Router();
// const verifyToken = require("../middlewares/verifyToken");
const orderController = require("../controllers/orderController");

router.post("/add-order", orderController.addToOrders);
router.get("/get-orders", orderController.getOrders);

module.exports = router;