const express = require("express");
const router = express.Router();
// const verifyToken = require("../middlewares/verifyToken");
const verifyAdminToken = require("../middlewares/verifyAdminToken")
const adminController = require("../controllers/adminController")

router.post("/login", adminController.login);
router.get("/get-dashboard", verifyAdminToken, adminController.getDashboard);
router.get("/get-orders", verifyAdminToken, adminController.getOrders);
router.post("/accept-orders", verifyAdminToken, adminController.acceptOrders);

module.exports = router;