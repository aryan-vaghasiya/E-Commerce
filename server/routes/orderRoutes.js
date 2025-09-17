const express = require("express");
const router = express.Router();
// const verifyToken = require("../middlewares/verifyToken");
const orderController = require("../controllers/orderController");

router.post("/add-order", orderController.addToOrders);
router.post("/check-coupon", orderController.checkCoupon);
router.get("/get-orders", orderController.getOrders);
router.post("/cancel-user", orderController.cancelOrderByUser);
router.get("/:id", orderController.getSingleOrder);

module.exports = router;