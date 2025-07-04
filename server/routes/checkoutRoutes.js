const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const userController = require("../controllers/userController");

router.post("/", userController.checkout);
router.get("/get-form", verifyToken, userController.getForm);

module.exports = router;