const express = require("express");
const router = express.Router();
// const verifyToken = require("../middlewares/verifyToken");
const verifyAdminToken = require("../middlewares/verifyAdminToken")
const adminController = require("../controllers/adminController")
const upload = require("../middlewares/uploadProductImages")

router.post("/login", adminController.login);
router.get("/get-dashboard", verifyAdminToken, adminController.getDashboard);
router.get("/get-orders", verifyAdminToken, adminController.getOrders);
router.post("/accept-orders", verifyAdminToken, adminController.orderStatus);
router.get("/order", verifyAdminToken, adminController.getSingleOrder);
router.get("/get-products", verifyAdminToken, adminController.getProducts);
router.get("/product", verifyAdminToken, adminController.getSingleProduct);
router.post("/edit-product", verifyAdminToken, adminController.setEditedProduct);
router.post("/upload/product/:id", verifyAdminToken, upload.array("images", 5), adminController.uploadProductImages);
router.post("/upload/product-thumbnail/:id", verifyAdminToken, upload.single("thumbnail"), adminController.uploadProductThumbnail);
router.post("/product/remove-images", verifyAdminToken, adminController.removeProductImages);

module.exports = router;