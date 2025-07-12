const express = require("express")
const cors = require("cors")
const verifyToken = require("./middlewares/verifyToken")
const userController = require("./controllers/userController")
const cartRoutes = require("./routes/cartRoutes")
const checkoutRoutes = require("./routes/checkoutRoutes")
const orderRoutes = require("./routes/orderRoutes")
const productRoutes = require("./routes/productRoutes")
const wishlistRoutes = require("./routes/wishlistRoutes")
const authRoutes = require("./routes/authRoutes")
const adminRoutes = require("./routes/adminRoutes")
const path = require("path")

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// console.log(__dirname);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/admin", adminRoutes);

app.post("/login", userController.login);
app.post("/login", userController.login);
app.post("/signup", userController.signup);


app.use("/auth", verifyToken, authRoutes);
app.use("/products", productRoutes);
app.use("/checkout", verifyToken, checkoutRoutes);
app.use("/cart", verifyToken, cartRoutes);
app.use("/orders", verifyToken, orderRoutes);
app.use("/wishlist", verifyToken, wishlistRoutes);

app.listen(port, () => {
    console.log(`E-commerce app on port ${port}`);
});