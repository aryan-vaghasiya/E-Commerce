const express = require("express")
const cors = require("cors")
const verifyToken = require("./middlewares/verifyToken")
const userController = require("./controllers/userController")
const cartRoutes = require("./routes/cartRoutes")
const checkoutRoutes = require("./routes/checkoutRoutes")
const orderRoutes = require("./routes/orderRoutes")
const productRoutes = require("./routes/productRoutes")
const wishlistRoutes = require("./routes/wishlistRoutes")
const walletRoutes = require("./routes/walletRoutes")
const authRoutes = require("./routes/authRoutes")
const adminRoutes = require("./routes/adminRoutes")
const path = require("path")
const cron = require("node-cron")
const dotenv = require('dotenv');
const referralRoutes = require("./routes/referralRoutes")
const profileRoutes = require("./routes/profileRoutes")
const { campaignCronJob, tenMinuteCronJob } = require("./utils/cronJobs")

dotenv.config();
const app = express();
// const port = process.env.EXPRESS_PORT;
const port = process.env.PORT || process.env.EXPRESS_PORT || 3000;

app.use(cors());

app.use(express.json());

app.get("/", async(req, res) => {
    res.status(200).send("Server Connected!!!")
})

cron.schedule('*/10 * * * *', tenMinuteCronJob)
// cron.schedule('* * * * * *', tenMinuteCronJob)

cron.schedule('*/5 * * * *', campaignCronJob)
// cron.schedule('* * * * * *', campaignCronJob)

app.post("/login", userController.login);
app.post("/signup", userController.signup);

app.use("/products", productRoutes);
app.use("/admin", adminRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/auth", verifyToken, authRoutes);
app.use("/checkout", verifyToken, checkoutRoutes);
app.use("/cart", verifyToken, cartRoutes);
app.use("/orders", verifyToken, orderRoutes);
app.use("/wishlist", verifyToken, wishlistRoutes);
app.use("/wallet", verifyToken, walletRoutes);
app.use("/referral", verifyToken, referralRoutes);
app.use("/profile", verifyToken, profileRoutes);

app.listen(port, () => {
    console.log(`E-commerce app on port ${port}`);
});