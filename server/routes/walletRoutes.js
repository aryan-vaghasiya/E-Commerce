const express = require("express");
const router = express.Router();
// const verifyToken = require("../middlewares/verifyToken");
const walletController = require("../controllers/walletController");

router.get("/get-wallet", walletController.getUserWallet);
router.post("/add-funds", walletController.addBalance);
router.post("/withdraw-funds", walletController.withdrawBalance);
router.get("/get-transactions", walletController.getWalletTransactions);

module.exports = router;