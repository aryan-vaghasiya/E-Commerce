const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const userController = require("../controllers/userController");


router.get("/user-details", userController.getUserDetails);


module.exports = router;