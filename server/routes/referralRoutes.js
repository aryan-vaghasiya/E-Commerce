const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const userController = require("../controllers/userController");


// router.post("/generate", userController.makeReferralToken);
router.post("/send-invite", userController.sendReferralInvite);
router.get("/get-summary", userController.getReferralsSummary);
router.get("/get-referrals", userController.getAcceptedReferrals);
router.get("/get-invites", userController.getReferralInvites);

module.exports = router;