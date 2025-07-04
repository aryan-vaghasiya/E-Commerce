const express = require("express");
const cors = require("cors");
const verifyToken = require("./middlewares/verifyToken");
const userController = require("./controllers/userController");
const checkoutController = require("./controllers/checkoutController");
const cartRoutes = require("./routes/cartRoutes")
const checkoutRoutes = require("./routes/checkoutRoutes")
const orderRoutes = require("./routes/orderRoutes")
const productRoutes = require("./routes/productRoutes")
const wishlistRoutes = require("./routes/wishlistRoutes")

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());


app.post("/login", userController.login);
app.post("/signup", userController.signup);
app.post("/addOrder", verifyToken, checkoutController.addToOrders);

app.use("/products", productRoutes);
app.use("/my-orders", verifyToken, orderRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/cart", verifyToken, cartRoutes);
app.use("/wishlist", verifyToken, wishlistRoutes);

app.listen(port, () => {
    console.log(`E-commerce app on port ${port}`);
});