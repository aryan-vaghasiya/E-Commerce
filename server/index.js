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

dotenv.config();
const app = express();
const port = process.env.EXPRESS_PORT;

app.use(cors());
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
        // await runQuery(`UPDATE product_discounts SET is_active = ? WHERE end_time <= NOW() AND is_active = ?`, [0, 1])
    }
    catch(err){
        console.error('Error in cron job:', err);
    }
});

// console.log(__dirname);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/admin", adminRoutes);

// app.post("/login", userController.login);
app.post("/login", userController.login);
app.post("/signup", userController.signup);


app.use("/auth", verifyToken, authRoutes);
app.use("/products", productRoutes);
app.use("/checkout", verifyToken, checkoutRoutes);
app.use("/cart", verifyToken, cartRoutes);
app.use("/orders", verifyToken, orderRoutes);
app.use("/wishlist", verifyToken, wishlistRoutes);
app.use("/wallet", verifyToken, walletRoutes);

app.listen(port, () => {
    console.log(`E-commerce app on port ${port}`);
});

    // sendMail({
    //     to: "demo@demo.com",
    //     subject: "Order Update",
    //     template: "order-status.hbs",
    //     replacements: {
    //         customerName: "John Doe",
    //         orderNumber: "#12345",
    //         orderDate: "August 20, 2025",
    //         orderTotal: "$149.99",
    //         currentStatus: "Dispatched",
    //         progressPercentage: 75,
    //         orderSteps: [
    //             {
    //                 label: "Order Placed",
    //                 status: "completed",
    //                 icon: "✓",
    //                 stepNumber: "1"
    //             },
    //             {
    //                 label: "Accepted",
    //                 status: "completed",
    //                 icon: "✓",
    //                 stepNumber: "2"
    //             },
    //             {
    //                 label: "Dispatched",
    //                 status: "completed",
    //                 icon: "✓",
    //                 stepNumber: "3"
    //             },
    //             {
    //                 label: "Delivered",
    //                 status: "pending",
    //                 stepNumber: "4"
    //             }
    //         ],
    //         estimatedDelivery: "August 26, 2025",
    //         trackingNumber: "1Z999AA1234567890",
    //         trackingUrl: "https://yourtrackingurl.com/track/1Z999AA1234567890",
    //         supportEmail: "support@yourstore.com",
    //         supportPhone: "1-800-123-4567",
    //         currentYear: "2025",
    //         additionalMessage: "Your package is currently in transit and should arrive soon!"
    //     }

    // })
    //     .catch(err => {
    //         console.error("Failed to send welcome email:", err);
    //     });

    //     sendMail({
    //     to: "demo@demo.com",
    //     subject: "Order Cancelled",
    //     template: "order-cancel-refunded.hbs",
    //     replacements: {
    //             customerName: "John Doe",
    //             orderId: "#12345",
    //             orderDate: "August 20, 2025",
    //             noOfItems: "3 items",
    //             cancellationDate: "August 25, 2025",
    //             cancellationReason: "Unfortunately, one of the items in your order is currently out of stock and we're unable to fulfill it within the expected timeframe. Rather than delay your entire order, we've decided to cancel it and process a full refund.",
    //             refundAmount: "149.99",
    //             orderValue: "139.99",
    //             discountValue: "10.00", // Optional
    //             supportLink: "https://cartify.com/support",
    //             supportPhone: "1-800-123-4567",
    //             currentYear: "2025"
    //         }
    // })
    //     .catch(err => {
    //         console.error("Failed to send welcome email:", err);
    //     });

    // sendMail({
    //     to: "demo@demo.com",
    //     subject: "Campaign email",
    //     template: "postdrop_test.hbs",
    //     replacements: {companyName: "Cartify", logo: "https://cdn.postdrop.io/starter-templates-v0/postdrop-logo-dark.png", brandColor: "#EC0867"}
    // })
    //     .catch(err => {
    //         console.error("Failed to send welcome email:", err);
    //     });