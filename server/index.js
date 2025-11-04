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
const runQuery = require("./db")
const dotenv = require('dotenv');
const { sendMail } = require("./mailer/sendMail")
const adminServices = require("./services/adminServices")
const referralRoutes = require("./routes/referralRoutes")
const profileRoutes = require("./routes/profileRoutes")

dotenv.config();
const app = express();
const port = process.env.EXPRESS_PORT;

// const whitelist = [
//     'http://localhost:5173',                 // Your local React app (for dev)
//     'https://e-commerce-orpin-rho-57.vercel.app', // Your deployed frontend
//     'https://industriously-foxiest-arla.ngrok-free.dev' // Your CURRENT ngrok URL
// ];

// const corsOptions = {
//     origin: function (origin, callback) {
//         // Check if the origin is in the whitelist or if it's not a browser (e.g., Postman)
//         if (whitelist.indexOf(origin) !== -1 || !origin) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     // This is the line that fixes your problem:
//     allowedHeaders: ['Content-Type', 'Authorization'] 
// };

// app.use(cors(corsOptions));


const corsOptions = {
  origin: '*', // Allow all origins
  allowedHeaders: ['Content-Type', 'Authorization'] // Explicitly allow these
};
app.use(cors(corsOptions));


// app.use(cors());
app.use(express.json());

cron.schedule('*/10 * * * *', async () => {
// cron.schedule('* * * * * *', async () => {
    try{
        console.log('Updating coupon status, every 10 minutes');
        await runQuery(`UPDATE coupons SET is_active = ? WHERE NOW() BETWEEN start_time AND end_time`, [1])
        await runQuery(`UPDATE coupons SET is_active = ? WHERE coupons_left <= 0`, [0])
        await runQuery(`UPDATE coupons SET is_active = ? WHERE end_time <= NOW() AND is_active = ?`, [0, 1])

        console.log('Updating product discount status, every 10 minutes');
        await runQuery(`UPDATE product_discounts SET is_active = ? WHERE NOW() BETWEEN start_time AND end_time`, [1])
        await runQuery(`UPDATE product_discounts SET is_active = ? WHERE  NOW() NOT BETWEEN start_time AND end_time AND is_active = ?`, [0, 1])
    }
    catch(err){
        console.error('Error in cron job:', err);
    }
});

let campaignRunning = false
cron.schedule('*/5 * * * *', async () => {
// cron.schedule('* * * * * *', async () => {
    if(campaignRunning){
        console.log("Previous job still running, skipping this one");
        return;
    }

    campaignRunning = true
    try{
        console.log("Checking for pending campaigns every 5 minutes");
        const campaigns = await runQuery(`SELECT 
                                            id 
                                        FROM campaigns 
                                        WHERE status = ?
                                            AND scheduled_at <= NOW()`, ["scheduled"]);

        for (let campaign of campaigns) {
            await adminServices.sendCampaignEmailService(campaign.id);
        }
    }
    catch(err){
        console.error('Error in campaign cron job:', err);
    }
    finally{
        campaignRunning = false
    }
})

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/admin", adminRoutes);

app.post("/login", userController.login);
app.post("/signup", userController.signup);

app.use("/auth", verifyToken, authRoutes);
app.use("/products", productRoutes);
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