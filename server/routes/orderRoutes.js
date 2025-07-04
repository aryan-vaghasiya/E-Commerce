const express = require("express");
const router = express.Router();
// const verifyToken = require("../middlewares/verifyToken");
const orderController = require("../controllers/orderController");

router.get("/", (req, res) => {
    // console.log(req.user);
    res.status(200).send("Successful!");
});

router.get("/get-orders", orderController.getOrders);

module.exports = router;