const runQuery = require("../db")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
const fs = require("fs-extra");
const path = require("path");
const dayjs = require('dayjs')
const adminUtils = require("../utils/adminUtils")
const walletService = require("./walletService");
const { sendMail } = require("../mailer/sendMail");

exports.loginAdmin = async(username, password) => {
    if(username !== "admin"){
        throw new Error ("You do not have Admin Privileges")
    }
    const result = await runQuery("SELECT * FROM users WHERE username = 'admin'")
    if (result.length === 0) {
        throw new Error ("Admin not found")
    }

    const user = result[0];
    const matched = await bcrypt.compare(password, user.password);
    if (matched) {
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: "admin"
            },
            process.env.JWT_SECRET,
            { expiresIn: "10h" }
        );
        return token
    }
    else {
        throw new Error("Wrong Password")
    }
}

exports.getDashboard = async() => {
    const [products] = await runQuery("SELECT COUNT(*) as products FROM products")
    const [orders] = await runQuery("SELECT COUNT(*) as orders FROM orders")
    const [sales] = await runQuery("SELECT SUM(final_total) as sales FROM orders")
    const [customers] = await runQuery("SELECT COUNT(*) as customers FROM users")
    const recentOrders = await runQuery(`SELECT 
                                            o.id,
                                            u.first_name,
                                            u.last_name,
                                            o.status,
                                            DATE_FORMAT(o.order_date, '%d/%m/%Y') as order_date,
                                            o.total,
                                            o.final_total
                                        FROM orders o JOIN users u on o.user_id = u.id
                                        ORDER BY o.order_date DESC
                                        LIMIT 5`);
    
    const dashboard = {products: products.products, orders: orders.orders, customers: customers.customers, sales: sales.sales}

    // console.log(dashboard);
    // console.log({...dashboard, recentOrders});
    return {...dashboard, recentOrders}
    // console.log(products, sales, customers);
    
}

exports.getAllOrders = async(page, limit, offset) => {
    // const results = await runQuery("SELECT p.*, i.stock FROM products p JOIN product_inventory i ON p.id = i.product_id LIMIT ? OFFSET ?", [limit, offset]);
    const results = await runQuery(`SELECT 
                                        o.id,
                                        u.first_name,
                                        u.last_name,
                                        o.status,
                                        DATE_FORMAT(o.order_date, '%d/%m/%Y') as order_date,
                                        o.total,
                                        o.final_total
                                    FROM orders o JOIN users u on o.user_id = u.id
                                    ORDER BY o.order_date DESC
                                    LIMIT ?
                                    OFFSET ?`, [limit, offset]);
    if(results.length === 0){
        throw new Error ("Could not select all orders (admin)")
    }
    // console.log(results);

    const [{total}] = await runQuery("SELECT COUNT(*) as total FROM orders")
    if(!total){
        throw new Error ("Could not count total products")
    }

    const adminOrders = {
        orders : results,
        // currentPage : page,
        pages: Math.ceil (total / limit),
        total
    }
    return adminOrders
}

exports.setOrderStatus = async(ids, status) => {
    // console.log(id, status);
    
    const setAccept = await runQuery(`UPDATE orders SET status = ? WHERE id IN ?`, [status, [ids]])
    if(setAccept.affectedRows === 0){
        throw new Error("Could not Update Order Status")
    }

    this.sendOrderStatusEmail(ids[0])
}

exports.sendOrderStatusEmail = async (id, status) => {
    const allDisplayStatuses = ["Pending", "Accepted", "Dispatched", "Delivered", "Cancelled"]

    const [getOrder] = await runQuery(`SELECT * FROM orders WHERE id = ?`, [id])
    const index = allDisplayStatuses.indexOf(getOrder.status.charAt(0).toUpperCase() + getOrder.status.slice(1).toLowerCase())
    if(index === 4){
        return console.log("order cancelled")
    }
    const currentStatus = allDisplayStatuses[index]
    const progressPercentage = parseInt((100/4) * (index + 1))

    const [getUser] = await runQuery(`SELECT * FROM users WHERE id = ?`, [getOrder.user_id])

    const orderSteps = [
                {
                    label: "Order Placed",
                    status: "pending",
                    stepNumber: "1"
                },
                {
                    label: "Accepted",
                    status: "pending",
                    stepNumber: "2"
                },
                {
                    label: "Dispatched",
                    status: "pending",
                    stepNumber: "3"
                },
                {
                    label: "Delivered",
                    status: "pending",
                    stepNumber: "4"
                }
            ]

    for(let i = 0; i < orderSteps.length; i++){
        if(i <= index){
            orderSteps[i].status = "completed"
            orderSteps[i].icon = "✓"
        }
    }

    const deliveryDate = dayjs(getOrder.order_date).add(7, "day");
    const estimatedDelivery = 
        index === 3 ? getOrder.last_updated 
        : deliveryDate.isBefore(dayjs()) ? dayjs().add(7, "day")
        : deliveryDate;

    const replacements = {
        fName: getUser.first_name,
        lName: getUser.last_name,
        orderId: getOrder.id,
        orderDate: dayjs(getOrder.order_date).format("MMMM DD, YYYY"),
        orderTotal: (getOrder.final_total).toFixed(2),
        currentStatus,
        progressPercentage,
        orderSteps,
        estimatedDelivery: dayjs(estimatedDelivery).format("MMMM DD, YYYY"),
        trackingNumber: "1Z999AA1234567890",
        trackingUrl: "https://yourtrackingurl.com/track/1Z999AA1234567890",
    }

    sendMail({
        to: getUser.email,
        subject: `Order Update - ${currentStatus}`,
        template: "order-status.hbs",
        replacements
    })
        .catch(err => {
            console.error("Failed to send welcome email:", err);
        });
}

// this.sendOrderStatusEmail(87)

exports.getOrderData = async (orderId) => {
    const [orderRow] = await runQuery(`SELECT
                                        o.id, 
                                        o.user_id,
                                        o.status,
                                        DATE_FORMAT(o.order_date, '%d/%m/%Y') as order_date,
                                        DATE_FORMAT(o.order_date, '%H:%i:%s') as order_time,
                                        o.total,
                                        o.discount_amount,
                                        o.final_total,
                                        u.first_name,
                                        u.last_name,
                                        u.addLine1,
                                        u.addLine2,
                                        u.state,
                                        u.city,
                                        u.pincode,
                                        u.number,
                                        u.email
                                    FROM orders o 
                                        JOIN users u 
                                            ON o.user_id = u.id
                                    WHERE o.id = ?`, [orderId]);

    const products = await runQuery(`SELECT
                                        oi.product_id,
                                        oi.quantity,
                                        oi.purchase_price as price,
                                        p.title,
                                        c.category,
                                        pd.discount_type,
                                        CASE 
                                            WHEN pd.offer_price IS NOT NULL 
                                                THEN ROUND(((pp.mrp - pd.offer_price) / pp.mrp) * 100, 2)
                                            ELSE NULL
                                        END AS offer_discount,
                                        pp.mrp,
                                        pp.discount,
                                        p.rating,
                                        p.brand,
                                        p.thumbnail
                                    FROM order_item oi 
                                        JOIN products p 
                                            ON oi.product_id = p.id
                                        JOIN categories c 
                                            ON c.id = p.category_id
                                        JOIN product_pricing pp 
                                            ON pp.product_id = p.id
                                        AND oi.order_id = ?
                                        AND NOW() BETWEEN pp.start_time AND pp.end_time
                                        LEFT JOIN product_discounts pd
                                            ON pd.product_id = p.id
                                            AND pd.is_active = 1
                                            AND (pd.start_time IS NULL OR pd.start_time <= NOW())
                                            AND (pd.end_time IS NULL OR pd.end_time > NOW())
                                    `,[orderId]);

    const payments = await runQuery(`SELECT * FROM order_payments WHERE order_id = ? ORDER BY created_at DESC`, [orderId])

    const result = {
        order: {
            id: orderRow.id,
            status: orderRow.status,
            order_date: orderRow.order_date,
            order_time: orderRow.order_time,
            total: orderRow.total,
            discount_amount: orderRow.discount_amount,
            final_total: orderRow.final_total,
        },
        user: {
            user_id: orderRow.user_id,
            first_name: orderRow.first_name,
            last_name: orderRow.last_name,
            addLine1: orderRow.addLine1,
            addLine2: orderRow.addLine2,
            state: orderRow.state,
            city: orderRow.city,
            pincode: orderRow.pincode,
            number: orderRow.number,
            email: orderRow.email,
        },
        products,
        payments,
    };

    return result;
}

exports.orderRefund = async (orderId, userId, reason = "", cancelledBy) => {
    const [orderPayment] = await runQuery(`SELECT
                                            o.id AS order_id,
                                            o.user_id,
                                            o.status AS order_status,
                                            o.final_total,
                                            o.coupon_id,
                                            o.order_date as orderDate,
                                            o.last_updated as cancellationDate,
                                            o.discount_amount,
                                            op.id AS payment_id,
                                            op.method,
                                            op.amount,
                                            op.status AS payment_status,
                                            op.transaction_id
                                        FROM orders o 
                                        JOIN order_payments op
                                            ON o.id = op.order_id
                                        WHERE o.id = ? AND o.user_id = ?`, [orderId, userId])
    if(!orderPayment){
        throw new Error ("Could not find order payment record")
    }

    let isEligibleForRefund = orderPayment.order_status !== "delivered" 
                            && orderPayment.order_status !== "cancelled"
                            && orderPayment.final_total === orderPayment.amount 
                            && orderPayment.payment_status === "paid";

    if (cancelledBy === "user") {
        isEligibleForRefund = isEligibleForRefund && orderPayment.order_status !== "dispatched";
    }

    if(!isEligibleForRefund){
        throw new Error ("Order not eligible for refund")
    }

    const userWallet = await walletService.getWallet(userId);

    const refundId = await walletService.addAmount(userWallet, orderPayment.amount, "REFUND", orderPayment.payment_id, `refund/orderId:${orderPayment.order_id}/of_paymentId:${orderPayment.payment_id}` + `/reason:${reason}`);

    const refundSuccessful = await runQuery(`INSERT INTO order_payments (order_id, method, amount, status, transaction_id) VALUES (?, ?, ?, ?, ?)`, [orderPayment.order_id, "wallet", orderPayment.amount, "refunded", refundId]);

    if(refundSuccessful.length === 0){
        throw new Error ("Could not add refund record")
    }

    await this.setOrderStatus([orderPayment.order_id], "cancelled")

    const orderItems = await runQuery(`SELECT product_id, quantity FROM order_item WHERE order_id = ?`, [orderId])
    for (const item of orderItems) {
        const updateStock = await runQuery(
            `UPDATE product_inventory SET stock = stock + ? WHERE product_id = ?`, [item.quantity, item.product_id]
        )
        if(updateStock.affectedRows === 0){
            throw new Error(`Could not Update Quantity for Product ID: ${item.product_id}`)
        }
    }

    if(orderPayment.coupon_id){
        await runQuery(`UPDATE coupon_usages SET is_reversed = ?, reversed_on = NOW() WHERE coupon_id = ? AND order_id = ?`, [true, orderPayment.coupon_id, orderId])
        await runQuery(`UPDATE coupons SET times_used = times_used - 1 WHERE id = ?`, [orderPayment.coupon_id])
    }

    this.sendOrderCancelRefundEmail(orderId, userId, reason, orderPayment, orderItems, cancelledBy)
}

exports.sendOrderCancelRefundEmail = async (orderId, userId, reason = "", order, orderItems, cancelledBy) => {
    const [getUser] = await runQuery(`SELECT * FROM users WHERE id = ?`, [userId])

    let noOfItems = 0
    for(let item of orderItems){
        noOfItems += item.quantity
    }

    const template = cancelledBy === "admin" ? "order-cancel-refunded.hbs" : "order-cancel-user.hbs"

    sendMail({
        to: getUser.email,
        subject: "Order Cancelled - Cartify",
        template,
        replacements: {
                fName: getUser.first_name,
                lName: getUser.last_name,
                orderId,
                orderDate: dayjs(order.orderDate).format("MMMM DD, YYYY"),
                cancellationDate: dayjs(order.cancellationDate).format("MMMM DD, YYYY"),
                noOfItems,
                cancellationReason: reason,
                refundAmount: order.amount,
                orderValue: order.amount,
            }
    })
        .catch(err => {
            console.error("Failed to send cancellation email:", err);
        });
}

exports.getAllProducts = async(page, limit, offset) => {
    const results = await runQuery(`SELECT
                                        p.id,
                                        p.title,
                                        pp.mrp,
                                        pp.discount,
                                        p.rating,
                                        p.brand,
                                        p.thumbnail,
                                        p.status,
                                        c.category,
                                        DATE_FORMAT(p.created_on, '%d/%m/%Y') as created_on,
                                        DATE_FORMAT(p.last_updated, '%d/%m/%Y') as last_updated,
                                        pin.stock,
                                        DATE_FORMAT(pin.last_updated, '%d/%m/%Y') as inventory_updated,

                                        pd.discount_type,

                                        CASE 
                                            WHEN pd.offer_price IS NOT NULL 
                                                THEN ROUND(((pp.mrp - pd.offer_price) / pp.mrp) * 100, 2)
                                            ELSE NULL
                                        END AS offer_discount,
                                        CASE 
                                            WHEN pd.offer_price IS NOT NULL 
                                                THEN pd.offer_price
                                            ELSE pp.price
                                        END AS price

                                    FROM products p
                                    JOIN product_inventory pin ON p.id = pin.product_id
                                    JOIN categories c ON c.id = p.category_id
                                    JOIN product_pricing pp ON pp.product_id = p.id
                                        AND NOW() BETWEEN pp.start_time AND pp.end_time

                                    LEFT JOIN product_discounts pd 
                                        ON pd.product_id = p.id
                                        AND pd.is_active = 1
                                        AND (pd.start_time IS NULL OR pd.start_time <= NOW())
                                        AND (pd.end_time IS NULL OR pd.end_time > NOW())

                                    ORDER BY p.last_updated DESC
                                    LIMIT ?
                                    OFFSET ?`, [limit, offset]);
    if(results.length === 0){
        throw new Error ("Could not select all products (admin)")
    }
    // console.log(results);

    const [{total}] = await runQuery("SELECT COUNT(*) as total FROM products")
    if(!total){
        throw new Error ("Could not count total products")
    }

    const adminProducts = {
        products : results,
        // currentPage : page,
        pages: Math.ceil (total / limit),
        total
    }
    return adminProducts
}

exports.getProductData = async (productId) => {
    const [result] = await runQuery(`SELECT 
                                        p.id,
                                        p.title,
                                        p.description,
                                        pp.price,
                                        pp.mrp,
                                        pp.discount,
                                        p.rating,
                                        p.brand,
                                        p.thumbnail,
                                        p.status,
                                        c.id as cid,
                                        c.category,
                                        DATE_FORMAT(p.created_on, '%d/%m/%Y') as created_on,
                                        DATE_FORMAT(p.last_updated, '%d/%m/%Y') as last_updated,
                                        pin.stock,
                                        DATE_FORMAT(pin.last_updated, '%d/%m/%Y') as last_updated,

                                        pd.discount_type,
                                        pd.start_time as offer_start_time,
                                        pd.end_time as offer_end_time,
                                        CASE 
                                            WHEN pd.offer_price IS NOT NULL 
                                                THEN ROUND(((pp.mrp - pd.offer_price) / pp.mrp) * 100, 2)
                                            ELSE NULL
                                        END AS offer_discount,
                                        CASE 
                                            WHEN pd.offer_price IS NOT NULL 
                                                THEN pd.offer_price
                                            ELSE NULL
                                        END AS offer_price
                                    FROM products p
                                    JOIN product_inventory pin ON p.id = pin.product_id
                                    JOIN categories c ON c.id = p.category_id
                                    JOIN product_pricing pp ON pp.product_id = p.id
                                        AND p.id = ?
                                        AND NOW() BETWEEN pp.start_time AND pp.end_time

                                    LEFT JOIN product_discounts pd 
                                        ON pd.product_id = p.id
                                        AND pd.is_active = 1
                                        AND (pd.start_time IS NULL OR pd.start_time <= NOW())
                                        AND (pd.end_time IS NULL OR pd.end_time > NOW())
                                    `, [productId]);
    const image = await runQuery(`SELECT id, image FROM product_images WHERE product_id = ?`,[productId])
    // const images = image.map(item => item.image)
    // console.log(images);

    // console.log({...result, images});
    // console.log(images);

    // console.log({...result, image})
    return {...result, image}
}

exports.getOffersData = async (productId) => {
    const offers = await runQuery(`SELECT 
                                    pd.id,
                                    pd.product_id,
                                    pd.discount_type,
                                    pd.start_time,
                                    pd.end_time,
                                    pd.is_active,
                                    pd.offer_price AS offer_selling_price,
                                    ROUND(((pp.mrp - pd.offer_price) / pp.mrp) * 100, 2) AS discount_percentage,
                                    pp.mrp,
                                    pp.price
                                FROM product_discounts pd
                                JOIN product_pricing pp ON pd.product_id = pp.product_id
                                    AND NOW() BETWEEN pp.start_time AND pp.end_time
                                WHERE pd.product_id = ?
                                ORDER BY pd.id DESC`,[productId])
    // console.log(offers);
    
    return offers
}

exports.setOfferData = async (product_id, offer_price, offer_discount, start_time, end_time) => {
    if (!offer_price || !offer_discount || !start_time || !end_time) {
        // console.log("no offer");
        throw new Error ("Not received values")
    }

    // Deactivate any overlapping time-based discounts
    await runQuery(
        `UPDATE product_discounts SET is_active = 0, 
            end_time = ?
            WHERE product_id = ? AND discount_type = 'time_based'
            AND ((start_time <= ? AND end_time >= ?) OR (start_time <= ? AND end_time >= ?))`,
        [start_time, product_id, start_time, start_time, end_time, end_time]
    );

    let is_active = 0;
    if(dayjs(start_time) <= dayjs()){
        console.log("i ran");
        
        is_active = 1
    }

    // Insert new time-based discount
    const insertDiscount = await runQuery(
        `INSERT INTO product_discounts (product_id, discount_type, offer_price, discount_percentage, start_time, end_time, is_active) VALUES (?, 'time_based', ?, ?, ?, ?, ?)`,
        [product_id, offer_price, offer_discount, start_time, end_time, is_active]
    );

    if (insertDiscount.affectedRows === 0) {
        throw new Error("Failed to insert discount.")
    }
    // const insertId = insertDiscount.insertId
    // const offers = await runQuery(`SELECT 
    //                             pd.*,
    //                             pp.mrp,
    //                             pp.price,
    //                             ROUND(pp.mrp - (pp.mrp * pd.discount_percentage / 100), 2) AS offer_selling_price
    //                             FROM product_discounts pd
    //                             JOIN product_pricing pp ON pd.product_id = pp.product_id
    //                                 AND NOW() BETWEEN pp.start_time AND pp.end_time
    //                             WHERE pd.product_id = ?
    //                                 AND pd.id = ?`,[product_id, insertId]);

    // console.log([offers]);

    const newOffers = await this.getOffersData(product_id)
    return newOffers
}

exports.editOfferData = async (offer_id, start_time, end_time) => {
    if(start_time){
        const updateStartTime = await runQuery(`UPDATE 
            product_discounts 
            SET start_time = ?
                WHERE id = ?`,
            [start_time, offer_id]
        );
        // console.log("start_time");
    
        if(updateStartTime.affectedRows === 0){
            throw new Error ("Could not extend start time")
        }
    }
    if(end_time){
        const updateEndTime = await runQuery(`UPDATE 
            product_discounts 
            SET end_time = ?
                WHERE id = ?`,
            [end_time, offer_id]
        );
        // console.log("end_time");
    
        if(updateEndTime.affectedRows === 0){
            throw new Error ("Could not extend end time")
        }
    }
}

exports.endOfferDate = async (offer_id) => {
    const endOffer = await runQuery(`UPDATE product_discounts SET end_time = NOW(), is_active = ? WHERE id = ?`, [0, offer_id])
    if(endOffer.affectedRows === 0){
        throw new Error ("Could not end offer")
    }
}

exports.deleteOfferData = async (offer_id) => {
    const deleteOffer = await runQuery(`DELETE FROM product_discounts WHERE id = ? AND is_active = ? AND start_time > NOW()`, [offer_id, 0])
    if(deleteOffer.affectedRows === 0){
        throw new Error ("Could not delete offer")
    }
}

exports.setProductData = async(id, title, brand, description, category, base_price, stock, base_discount, base_mrp, tenYearsLater, currentTime) => {
    // console.log({id, title, brand, description, price, stock});
    // console.log({start_time, end_time, tenYearsLater});
    // console.log({id, title, brand, description, base_price, stock, base_discount, base_mrp, start_time, end_time , tenYearsLater, offer_price, offer_discount, currentTime});

    
    let categoryId = category.id
    const categoryName = category.category
    // console.log(categoryId, categoryName);

    const getCategory = await runQuery(`SELECT id FROM categories WHERE id = ? AND category = ?`, [categoryId, categoryName])
    if(getCategory.length === 0){
        const insertCategory = await runQuery(`INSERT INTO categories (category) VALUES (?)`, [categoryName])
        categoryId = insertCategory.insertId
    }
    // console.log(categoryId, categoryName);

    const updateProduct = await runQuery(`UPDATE products SET title = ?, brand = ?, description = ?, category_id = ? WHERE id = ?`, [title, brand, description, categoryId, id])
    if(updateProduct.affectedRows === 0){
        throw new Error("Could not Edit Product Details")
    }

    const updateStock = await runQuery(`UPDATE product_inventory SET stock = ? WHERE product_id = ?`, [stock, id])
    if(updateStock.affectedRows === 0){
        throw new Error("Could not Edit Product Stock")
    }

    const [current] = await runQuery(`SELECT * FROM product_pricing 
        WHERE product_id = ? AND start_time <= NOW() AND end_time > NOW() 
        ORDER BY id DESC LIMIT 1`, [id]
    );
    // console.log(current);
    

    if (
        current &&
        parseFloat(current.price) === parseFloat(base_price) &&
        parseFloat(current.mrp) === parseFloat(base_mrp) &&
        parseFloat(current.discount) === parseFloat(base_discount)
    ) {
    console.log("No base price changes detected.");
        // return;
        // return { updated: false };
    }
    else{
        const [newEndDate] = await runQuery(`SELECT DATE_SUB(?, INTERVAL 1 SECOND) as new_eTime`, [currentTime])
        const new_eTime = newEndDate.new_eTime

        const res = await runQuery(`UPDATE product_pricing SET end_time = ? WHERE id = ?`, [new_eTime, current.id]);
        if (res.affectedRows === 0) throw new Error("Failed to update old pricing");
        // if (res[0].affectedRows === 0) throw new Error("Failed to update old pricing");

        const insert = await runQuery(`INSERT INTO product_pricing 
            (product_id, start_time, end_time, price, mrp, discount)
            VALUES (?, ?, ?, ?, ?, ?)`, 
            [id, currentTime, tenYearsLater, base_price, base_mrp, base_discount]
        );

        if (insert.affectedRows === 0) throw new Error("Failed to insert new pricing");
        // if (insert[0].affectedRows === 0) throw new Error("Failed to insert new pricing");
    }




    // const [selectLastEntry] = await runQuery(`SELECT * FROM product_pricing WHERE product_id = ? ORDER BY id DESC`,[id])
    // // console.log(selectLastEntry.id);
    // const lastEntry = selectLastEntry.id
    // const lastPrice = selectLastEntry.price
    // const lastMrp = selectLastEntry.mrp
    // const lastDiscount = selectLastEntry.discount
    // if(!lastEntry){
    //     throw new Error("Could not Find Pricing Entry")
    // }

    // const updateOldPricing = await runQuery(`UPDATE product_pricing SET end_time = ? WHERE id = ? AND product_id`,[start_time, lastEntry, id]);
    // if(updateOldPricing.affectedRows === 0){
    //     throw new Error("Could not Update Old Pricing")
    // }

    // const [newOfferStartDate] = await runQuery(`SELECT DATE_ADD(?, INTERVAL 1 SECOND) as new_sTime`, [start_time])
    // // console.log(start_time);
    // // console.log(newOfferStartDate.new_time);
    // const new_sTime = newOfferStartDate.new_sTime
    
    // const addNewPricing = await runQuery(`INSERT INTO product_pricing (product_id, start_time, end_time, price, mrp, discount) VALUES (?, ?, ?, ?, ?, ?)`, [id, new_sTime, end_time, price, mrp, discount])
    // if(addNewPricing.affectedRows === 0){
    //     throw new Error("Could not Add New Pricing")
    // }

    // const [newOfferEndDate] = await runQuery(`SELECT DATE_ADD(?, INTERVAL 1 SECOND) as new_eTime`, [end_time])
    // const new_eTime = newOfferEndDate.new_eTime
    // const addLaterPricing = await runQuery(`INSERT INTO product_pricing (product_id, start_time, end_time, price, mrp, discount) VALUES (?, ?, ?, ?, ?, ?)`, [id, new_eTime, tenYearsLater, lastPrice, lastMrp, lastDiscount])



    // // 1. Find currently active pricing for the product
    // const [activePricing] = await runQuery(`
    // SELECT * FROM product_pricing 
    //     WHERE product_id = ? AND NOW() BETWEEN start_time AND end_time
    //     ORDER BY id DESC LIMIT 1
    // `, [id]);

    // if (!activePricing) {
    //     throw new Error("No active pricing entry found for this product");
    // }

    // const activeId = activePricing.id;
    // const prevPrice = activePricing.price;
    // const prevMrp = activePricing.mrp;
    // const prevDiscount = activePricing.discount;

    // // 2. Set end_time of current pricing to new offer's start time
    // const update = await runQuery(
    //     `UPDATE product_pricing SET end_time = ? WHERE id = ?`,
    //     [start_time, activeId]
    // );

    // if (update.affectedRows === 0) {
    //     throw new Error("Failed to update previous pricing");
    // }

    // // 3. Add the new pricing offer (start_time + 1s to avoid exact overlap)
    // const [{ new_sTime }] = await runQuery(
    //     `SELECT DATE_ADD(?, INTERVAL 1 SECOND) AS new_sTime`,
    //     [start_time]
    // );

    // // You can also use: new Date(new Date(start_time).getTime() + 1000) in JS directly
    // const insertNew = await runQuery(
    //     `INSERT INTO product_pricing (product_id, start_time, end_time, price, mrp, discount) VALUES (?, ?, ?, ?, ?, ?)`,
    //     [id, new_sTime, end_time, price, mrp, discount]
    // );

    // if (insertNew.affectedRows === 0) {
    //     throw new Error("Failed to insert new pricing");
    // }

    // // 4. Only re-add the "previous" pricing after offer ends if this is a temporary discount
    // // (optional, based on business rule)
    // const reAddTime = await runQuery(
    //     `SELECT DATE_ADD(?, INTERVAL 1 SECOND) AS new_eTime`,
    //     [end_time]
    // );
    // const new_eTime = reAddTime[0].new_eTime;

    // // const defaultEnd = '2035-07-17 12:30:00'; // or calculate tenYearsLater in JS

    // const reinstate = await runQuery(
    //     `INSERT INTO product_pricing (product_id, start_time, end_time, price, mrp, discount) VALUES (?, ?, ?, ?, ?, ?)`,
    //     [id, new_eTime, tenYearsLater, prevPrice, prevMrp, prevDiscount]
    // );

}

exports.setProductImages = async(productId, imagePaths) => {
    let newImage = [];
    for (let i = 0; i < imagePaths.length; i++) {
        const insertImage = await runQuery(
            `INSERT INTO product_images (product_id, image) VALUES (?, ?)`,
            [productId, imagePaths[i]]
        );
        newImage.push({id: insertImage.insertId, image: `${imagePaths[i]}`})
    }
    // console.log(newImage);
    return newImage;
}

exports.removeImages = async(toDeleteIds) => {
    // const paths = []
    // for (let i = 0; i < toDeleteIds.length; i++) {
    //     const getPath = await runQuery(`SELECT image FROM product_images WHERE id =?`, [toDeleteIds[i]])
    //     // console.log(getPath);
    //     // console.log(getPath[0].image);
    //     paths.push(getPath[0].image)
    //     await runQuery(`DELETE FROM product_images WHERE id = ?`,[toDeleteIds[i]]);
    // }
    // // console.log(paths);
    // for (let i = 0; i < toDeleteIds.length; i++) {
    //     const absolutePath = path.join(__dirname, "..", `${paths[i]}`)
    //     // console.log(absolutePath);
    //     await fs.remove(absolutePath)
    // }

    for (let i = 0; i < toDeleteIds.length; i++) {
        const getPath = await runQuery(`SELECT image FROM product_images WHERE id =?`, [toDeleteIds[i]])
        // console.log(getPath);
        // console.log(getPath[0].image);
        // paths.push(getPath[0].image)
        await runQuery(`DELETE FROM product_images WHERE id = ?`,[toDeleteIds[i]]);
        const absolutePath = path.join(__dirname, "..", `${getPath[0].image}`)
        await fs.remove(absolutePath)
    }
}

exports.setThumbnail = async(productId, imagePath) => {
    const [oldThumbnail] = await runQuery(`SELECT thumbnail FROM products WHERE id = ?`, [productId]) 
    await runQuery("UPDATE products SET thumbnail = ? WHERE id = ?", [imagePath, productId]);

    // console.log(oldThumbnail.thumbnail);
    const absolutePath = path.join(__dirname, "..", `${oldThumbnail.thumbnail}`)
    await fs.remove(absolutePath)
}

exports.addDetails = async (title, brand, description, price, status, stock, mrp, discount, selected_category) => {

    let categoryId = selected_category.id
    const categoryName = selected_category.category
    // console.log(categoryId, categoryName);

    const category = await runQuery(`SELECT id FROM categories WHERE id = ? AND category = ?`, [categoryId, categoryName])
    if(category.length === 0){
        const insertCategory = await runQuery(`INSERT INTO categories (category) VALUES (?)`, [categoryName])
        categoryId = insertCategory.insertId
    }
    // console.log(categoryId, categoryName);

    const result = await runQuery(`
        INSERT INTO products (title, brand, description, status, rating, category_id) 
        VALUES (?, ?, ?, ?, ?, ?)`,[title, brand, description, status, 0.00, categoryId]
    )
    if(result.affectedRows === 0){
        throw new Error ("Could not add Product Details")
    }

    const productId = result.insertId
    // console.log(productId);

    const addPricing = runQuery(`INSERT INTO product_pricing (product_id, price, mrp, discount) VALUES (?, ?, ?, ?)`, [productId, price, mrp, discount])
    if(addPricing.affectedRows === 0){
        throw new Error("Could not Add Pricing")
    }

    const addStock = await runQuery(`INSERT INTO product_inventory (product_id, stock) VALUES (?, ?)`,[productId, stock])
    if(addStock.affectedRows === 0){
        throw new Error("Could Add Stock")
    }

    return productId
}

exports.updateProductStatus = async (newStatus, productId) => {
    await runQuery(`UPDATE products SET status = ? WHERE id = ?`, [newStatus, productId])
}

// exports.deleteProductPermanently = async(productId) => {
//     const productInventory =  await runQuery(`DELETE FROM product_inventory WHERE product_id = ?`,[productId])
//     if(productInventory.affectedRows === 0){
//         throw new Error ("Product Inventory Not Found")
//     }
//     const productImages = await runQuery(`DELETE FROM product_images WHERE product_id = ?`,[productId])
//     if(productImages.affectedRows === 0){
//         throw new Error ("Product Images Not Found")
//     }
//     const removeCartItem = await runQuery(`DELETE FROM cart_item WHERE product_id = ?`, [productId])
//     if(removeCartItem.affectedRows === 0){
//         throw new Error ("Couldn't remove Product from Cart")
//     }
//     const removeOrderItem =  await runQuery(`DELETE FROM order_item WHERE product_id = ?`,[productId])
//     if(removeOrderItem.affectedRows === 0){
//         throw new Error ("Couldn't remove Product from Orders")
//     }
//     const productDetails = await runQuery(`DELETE FROM products WHERE id = ?`,[productId])
//     if(productDetails.affectedRows === 0){
//         throw new Error ("Product Details Not Found")
//     }

//     const absolutePath = path.join(__dirname, "../uploads/products", `${productId}`)
//     // console.log(absolutePath);
//     fs.remove(absolutePath)
// }

exports.getProductForCoupon = async (query, price) => {
    const result = await runQuery(`SELECT 
                                    p.id, 
                                    p.title,
                                    c.category,

                                    CASE 
                                        WHEN pd.offer_price IS NOT NULL 
                                            THEN pd.offer_price
                                        ELSE pp.price
                                    END AS price

                                    FROM products p
                                    JOIN categories c ON c.id = p.category_id
                                    JOIN product_pricing pp ON pp.product_id = p.id
                                        AND NOW() BETWEEN pp.start_time AND pp.end_time
                                    LEFT JOIN product_discounts pd ON pd.product_id = p.id
                                        AND pd.is_active = ?
                                        AND (pd.start_time IS NULL OR pd.start_time <= NOW())
                                        AND (pd.end_time IS NULL OR pd.end_time > NOW())

                                    WHERE p.status = ? 
                                        AND p.title LIKE ?
                                    HAVING price > ? 
                                    LIMIT ?`,[1, 'active', `%${query}%`, price, 5])
    // const result = await runQuery(`SELECT 
    //                                 id, 
    //                                 title 
    //                                 FROM products 
    //                                 WHERE status = ? 
    //                                 AND title LIKE ? 
    //                                 LIMIT ?`,['active', `%${query}%`, 5])

    // console.log(result);
    return result
}

exports.addCouponData = async(name, code, discount_value, discount_type, applies_to, threshold_amount, total_coupons,  min_cart_value, for_new_users_only, limit_per_user, start_time, end_time, productIds, categoryIds) => {

    const ifActive = await runQuery(`SELECT * FROM coupons WHERE code = ? AND is_active = ?`, [code, 1])
    if(ifActive.length > 0) {
        throw new Error ("This Code is already Active")
    }

    const result = await runQuery(`INSERT INTO coupons (
        name, 
        code, 
        discount_type, 
        discount_value, 
        threshold_amount, 
        applies_to, 
        limit_per_user, 
        min_cart_value,
        for_new_users_only,
        start_time, 
        end_time, 
        total_coupons)
        
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, code, discount_type, discount_value, threshold_amount, applies_to, limit_per_user, min_cart_value, for_new_users_only, start_time, end_time, total_coupons]
    );

    if(result.affectedRows === 0){
        throw new Error ("Could not insert Coupon")
    }
    const couponId = result.insertId;

    if (applies_to === 'category' && Array.isArray(categoryIds)) {
        const values = categoryIds.map(cid => [couponId, cid]);
        const categoryCoupon = await runQuery(`INSERT INTO coupon_categories (coupon_id, category_id) VALUES ?`, [values]);

        if(categoryCoupon.affectedRows === 0){
            throw new Error ("Could not add Category coupon")
        }
    }

    if (applies_to === 'product' && Array.isArray(productIds)) {
        const values = productIds.map(pid => [couponId, pid]);
        const productCoupon = await runQuery(`INSERT INTO coupon_products (coupon_id, product_id) VALUES ?`, [values]);

        if(productCoupon.affectedRows === 0){
            throw new Error ("Could not add Product coupon")
        }
    }
}

exports.getAllCoupons = async(queryParams) => {

    // console.log(queryParams);
    
    const {
        page,
        limit,
        offset,
        search = "",
        discount_type = "",
        apply_on = "",
        is_active = "",
        start_date = "",
        end_date = ""
    } = queryParams;

    let whereClause = ` WHERE 1=1`
    const params = []
    const countParams = [];

    if (search) {
        whereClause += ` AND (name LIKE ? OR code LIKE ?)`;
        const likeQuery = `%${search}%`;
        params.push(likeQuery, likeQuery);
        countParams.push(likeQuery, likeQuery)
    }

    if (discount_type) {
        // console.log(discount_type);
        
        whereClause += ` AND discount_type = ?`;
        params.push(discount_type);
        countParams.push(discount_type)
    }

    if (apply_on) {
        whereClause += ` AND applies_to = ?`;
        params.push(apply_on);
        countParams.push(apply_on)
    }

    if (is_active) {
        whereClause += ` AND is_active = ?`;
        params.push(parseInt(is_active));
        countParams.push(parseInt(is_active))
    }

    if (start_date) {
        whereClause += ` AND start_time >= ?`;
        params.push(start_date);
        countParams.push(start_date)
    }

    if (end_date) {
        whereClause += ` AND end_time <= ?`;
        params.push(end_date);
        countParams.push(end_date)
    }

    let dataQuery = `SELECT
                        id, 
                        name, 
                        code, 
                        discount_type,
                        discount_value,
                        threshold_amount, 
                        applies_to, 
                        for_new_users_only, 
                        limit_per_user, 
                        DATE_FORMAT(start_time, '%d/%m/%Y') as start_time, 
                        DATE_FORMAT(end_time, '%d/%m/%Y') as end_time, 
                        is_active, 
                        created_at,  
                        total_coupons, 
                        coupons_left, 
                        times_used
                    FROM coupons
                    ${whereClause}
                    ORDER BY created_at DESC
                    LIMIT ? OFFSET ?
                    `;

    params.push(limit, offset);

    // console.log(dataQuery);
    // console.log(params);
    
    const results = await runQuery(dataQuery, params);
    // console.log(results);

    if(results.length === 0){
        throw new Error ("Could not select all coupons")
    }

    const [{total}] = await runQuery(`SELECT COUNT(*) as total FROM coupons ${whereClause}`,countParams)
    if(!total){
        throw new Error ("Could not count total coupons")
    }

    const allCoupons = {
        coupons : results,
        // currentPage : page,
        pages: Math.ceil (total / limit),
        total
    }
    return allCoupons

    // const results = await runQuery(`SELECT
    //                                     id, 
    //                                     name, 
    //                                     code, 
    //                                     discount_type,
    //                                     discount_value,
    //                                     threshold_amount, 
    //                                     applies_to, 
    //                                     for_new_users_only, 
    //                                     limit_per_user, 
    //                                     DATE_FORMAT(start_time, '%d/%m/%Y') as start_time, 
    //                                     DATE_FORMAT(end_time, '%d/%m/%Y') as end_time, 
    //                                     is_active, 
    //                                     DATE_FORMAT(created_at, '%d/%m/%Y') as created_at,  
    //                                     total_coupons, 
    //                                     times_used
    //                                 FROM coupons

    //                                 ORDER BY created_at DESC
    //                                 LIMIT ?
    //                                 OFFSET ?`, [limit, offset]);
}

exports.getSingleCoupon = async (couponId) => {
    let [coupon] = await runQuery(`SELECT * FROM coupons WHERE id = ?`, [couponId])

    if(!coupon){
        throw new Error("Coupon does not exist")
    }

    if(coupon.applies_to === "product"){
        const orders = await runQuery(`SELECT * FROM orders WHERE coupon_id = ? AND status != ?`, [couponId, "cancelled"])
        const orderIds = orders.map(item => item.id)
        // console.log(orderIds);

        let orderItems = []

        if(orderIds.length > 0){
            orderItems = await runQuery(`SELECT
                                            oi.product_id,
                                            SUM(oi.quantity) AS total_quantity,
                                            SUM(oi.purchase_price * oi.quantity) AS total_purchase_price
                                        FROM order_item oi
                                        JOIN (
                                            SELECT DISTINCT product_id 
                                            FROM coupon_products    
                                            WHERE coupon_id = ?
                                        ) cp 
                                            ON oi.product_id = cp.product_id
                                        WHERE oi.order_id IN (?)
                                        GROUP BY oi.product_id`, [couponId, orderIds])
            // console.log(orderItems);
        }
        const [{totalLoss}] = await runQuery(`SELECT SUM(discount_amount) as totalLoss FROM orders WHERE coupon_id = ? AND status != ?`, [couponId, "cancelled"])
        const totalSales = orderItems.reduce((acc, value) => acc + value.total_purchase_price, 0)
        // console.log(totalSales);

        coupon = {...coupon, totalLoss, totalSales}
        return(coupon)
    }


    if(coupon.applies_to === "category"){
        const orders = await runQuery(`SELECT * FROM orders WHERE coupon_id = ? AND status != ?`, [couponId, "cancelled"])
        const orderIds = orders.map(item => item.id)
        // console.log(orderIds);

        let orderItems = []

        if(orderIds.length > 0){
            orderItems = await runQuery(`SELECT 
                                            oi.product_id,
                                            SUM(oi.quantity) AS total_quantity,
                                            SUM(oi.purchase_price * oi.quantity) AS total_purchase_price
                                        FROM order_item oi
                                        JOIN products p 
                                            ON oi.product_id = p.id
                                        JOIN (
                                            SELECT DISTINCT category_id 
                                            FROM coupon_categories    
                                            WHERE coupon_id = ?
                                        ) cc
                                            ON cc.category_id = p.category_id
                                        WHERE oi.order_id IN (?)
                                        GROUP BY oi.product_id`, [couponId, orderIds])
            // console.log(orderItems);
        }
        const [{totalLoss}] = await runQuery(`SELECT SUM(discount_amount) as totalLoss FROM orders WHERE coupon_id = ? AND status != ?`, [couponId, "cancelled"])
        const totalSales = orderItems.reduce((acc, value) => acc + value.total_purchase_price, 0)
        // console.log(totalSales);

        coupon = {...coupon, totalLoss, totalSales}
        return(coupon)
    }

    // else{
        const [{totalLoss}] = await runQuery(`SELECT SUM(discount_amount) as totalLoss FROM orders WHERE coupon_id = ? AND status != ?`, [couponId, "cancelled"])
        const [{totalSales}] = await runQuery(`SELECT SUM(final_total) as totalSales FROM orders WHERE coupon_id = ? AND status != ?`, [couponId, "cancelled"])

        coupon = {...coupon, totalLoss, totalSales}
        return(coupon)
    // }
}


exports.getCouponProducts = async (couponId, limit, offset) => {
    let [coupon] = await runQuery(`SELECT * FROM coupons WHERE id = ?`, [couponId])

    if(!coupon){
        throw new Error("Coupon does not exist")
    }

    let totalProducts = 0
    let products = []
    let orderItems = []

    if(coupon.applies_to === "product"){
        const result = await runQuery(`SELECT 
                                        COUNT(*) as totalProducts
                                        FROM coupon_products
                                        WHERE coupon_id = ?
                                    `, [couponId]);
        totalProducts = result[0].totalProducts;
        products = await runQuery(`SELECT 
                                        p.id,
                                        p.title,
                                        p.description,
                                        p.rating,
                                        p.brand,
                                        p.thumbnail,
                                        p.status,
                                        c.category,
                                        DATE_FORMAT(p.created_on, '%d/%m/%Y') as created_on,
                                        DATE_FORMAT(p.last_updated, '%d/%m/%Y') as last_updated,

                                        pd.discount_type,
                                        pd.start_time as offer_start_time,
                                        pd.end_time as offer_end_time,
                                        CASE 
                                            WHEN pd.offer_price IS NOT NULL 
                                                THEN ROUND(((pp.mrp - pd.offer_price) / pp.mrp) * 100, 2)
                                            ELSE NULL
                                        END AS offer_discount,
                                        CASE 
                                            WHEN pd.offer_price IS NOT NULL 
                                                THEN pd.offer_price
                                            ELSE pp.price
                                        END AS price
                                    FROM coupon_products cp
                                    JOIN products p
                                        ON p.id = cp.product_id
                                    JOIN categories c
                                        ON c.id = p.category_id
                                    JOIN product_pricing pp 
                                        ON pp.product_id = p.id
                                        AND NOW() BETWEEN pp.start_time AND pp.end_time

                                    LEFT JOIN product_discounts pd 
                                        ON pd.product_id = p.id
                                        AND pd.is_active = 1
                                        AND (pd.start_time IS NULL OR pd.start_time <= NOW())
                                        AND (pd.end_time IS NULL OR pd.end_time > NOW())

                                    WHERE cp.coupon_id = ?
                                    ORDER BY p.id ASC
                                    LIMIT ?
                                    OFFSET ?`
                                , [couponId, limit, offset]);

        const orders = await runQuery(`SELECT * FROM orders WHERE coupon_id = ? AND status != ?`, [couponId, "cancelled"])
        const orderIds = orders.map(item => item.id)
        // console.log(orderIds);

        if(orderIds.length > 0){
            orderItems = await runQuery(`SELECT 
                                            oi.product_id,
                                            SUM(oi.quantity) AS total_quantity,
                                            SUM(oi.purchase_price * oi.quantity) AS total_purchase_price
                                        FROM order_item oi
                                        JOIN (
                                            SELECT DISTINCT product_id 
                                            FROM coupon_products    
                                            WHERE coupon_id = ?
                                        ) cp 
                                            ON oi.product_id = cp.product_id
                                        WHERE oi.order_id IN (?)
                                        GROUP BY oi.product_id`, [couponId, orderIds])
            // console.log(orderItems);
        }

        // const quantityMap = Object.fromEntries(
        //     orderItems.map(q => [q.product_id, {total_quantity: q.total_quantity, total_purchase_price: q.total_purchase_price}])
        // );
        // console.log(quantityMap);
        // console.log(quantityMap[3].total_quantity);

    }

    if(coupon.applies_to === "category"){

        const categories = await runQuery(`SELECT category_id FROM coupon_categories WHERE coupon_id = ?`, [couponId]);
        const categoryIds = categories.map(item => item.category_id)
        // console.log(categoryIds);
        

        const result = await runQuery(`SELECT 
                                        COUNT(*) as totalProducts
                                        FROM products
                                        WHERE category_id IN ?
                                    `, [[categoryIds]]);
        totalProducts = result[0].totalProducts;

        products = await runQuery(`SELECT 
                                        p.id,
                                        p.title,
                                        p.description,
                                        p.rating,
                                        p.brand,
                                        p.thumbnail,
                                        p.status,
                                        c.category,
                                        DATE_FORMAT(p.created_on, '%d/%m/%Y') as created_on,
                                        DATE_FORMAT(p.last_updated, '%d/%m/%Y') as last_updated,

                                        pd.discount_type,
                                        pd.start_time as offer_start_time,
                                        pd.end_time as offer_end_time,
                                        CASE 
                                            WHEN pd.offer_price IS NOT NULL 
                                                THEN ROUND(((pp.mrp - pd.offer_price) / pp.mrp) * 100, 2)
                                            ELSE NULL
                                        END AS offer_discount,
                                        CASE 
                                            WHEN pd.offer_price IS NOT NULL 
                                                THEN pd.offer_price
                                            ELSE pp.price
                                        END AS price
                                    FROM coupon_categories cc
                                    JOIN products p
                                        ON p.category_id = cc.category_id
                                    JOIN categories c
                                        ON c.id = p.category_id
                                    JOIN product_pricing pp 
                                        ON pp.product_id = p.id
                                        AND NOW() BETWEEN pp.start_time AND pp.end_time

                                    LEFT JOIN product_discounts pd 
                                        ON pd.product_id = p.id
                                        AND pd.is_active = 1
                                        AND (pd.start_time IS NULL OR pd.start_time <= NOW())
                                        AND (pd.end_time IS NULL OR pd.end_time > NOW())

                                    WHERE cc.coupon_id = ?
                                    ORDER BY p.id ASC
                                    LIMIT ?
                                    OFFSET ?`
                                , [couponId, limit, offset]);

        const orders = await runQuery(`SELECT * FROM orders WHERE coupon_id = ? AND status != ?`, [couponId, "cancelled"])
        const orderIds = orders.map(item => item.id)
        // console.log(orderIds);


        if(orderIds.length > 0){
            orderItems = await runQuery(`SELECT 
                                            oi.product_id,
                                            SUM(oi.quantity) AS total_quantity,
                                            SUM(oi.purchase_price * oi.quantity) AS total_purchase_price
                                        FROM order_item oi
                                        JOIN products p 
                                            ON oi.product_id = p.id
                                        JOIN (
                                            SELECT DISTINCT category_id 
                                            FROM coupon_categories    
                                            WHERE coupon_id = ?
                                        ) cc
                                            ON cc.category_id = p.category_id
                                        WHERE oi.order_id IN (?)
                                        GROUP BY oi.product_id`, [couponId, orderIds])
            // console.log(orderItems);
        }
    }

        products = products.map(item => {
            let coupon_discount_amount = 0;
            if(coupon.discount_type === "fixed"){
                coupon_discount_amount = coupon.discount_value
            }
            else{
                coupon_discount_amount = (item.price/100) * coupon.discount_value
            }
            if(coupon.threshold_amount && coupon_discount_amount > coupon.threshold_amount){
                coupon_discount_amount = coupon.threshold_amount 
            }
            const matchingOrderItem = orderItems.find(o => o.product_id === item.id);
            const total_quantity = matchingOrderItem ? matchingOrderItem.total_quantity : 0
            const total_purchase_price = matchingOrderItem ? matchingOrderItem.total_purchase_price : 0 

            // let total_selling_price = coupon.discount_type === "percent" ? 
            //                     total_purchase_price/(100 - coupon.discount_value) * 100
            //                     :
            //                     total_purchase_price + (coupon.discount_value * total_quantity);
            
            // let total_product_discount = total_selling_price - total_purchase_price
            // console.log("total 1",total_product_discount);
            // console.log("total 2",coupon.threshold_amount * total_quantity);

            // if (coupon.threshold_amount && total_product_discount > (coupon.threshold_amount * total_quantity)) {
            //     total_product_discount = coupon.threshold_amount;
            // }
        
            let total_selling_price;
            let total_product_discount;

            if (coupon.discount_type === "percent") {
                total_product_discount = Math.min(
                    (total_purchase_price * coupon.discount_value) / (100 - coupon.discount_value),
                    coupon.threshold_amount ? coupon.threshold_amount * total_quantity : Infinity
                );

                total_selling_price = total_purchase_price + total_product_discount;
            } 
            else {
                total_product_discount = coupon.discount_value * total_quantity;
                total_selling_price = total_purchase_price + total_product_discount;
            }

            // if(coupon.discount_type === "percent"){
            //     let total_selling_price = total_purchase_price/(100 - coupon.discount_value) * 100
            //     console.log((total_selling_price).toFixed(2));
                
            // }

            // let productDiscount = coupon.discount_type === 'percent' 
            //             ? 
            //             total_purchase_price * (coupon.discount_value / 100)
            //             : 
            //             coupon.discount_value * total_quantity;
            // if (coupon.threshold_amount && productDiscount > coupon.threshold_amount) {
            //     productDiscount = coupon.threshold_amount;
            // }
            return {
                    ...item,
                    coupon_discount_amount: coupon_discount_amount, 
                    final_price: item.price - coupon_discount_amount,
                    // total_quantity: quantityMap[item.id] || 0 
                    total_quantity,
                    total_purchase_price,
                    total_product_discount
                }
    })

    const allProducts = {
        products,
        pages: Math.ceil (totalProducts / limit),
        totalProducts
    }
    return allProducts
}

exports.getCouponUsages = async (couponId, limit, offset) => {
    const [{totalUsages}] = await runQuery(`SELECT COUNT(*) AS totalUsages FROM coupon_usages WHERE coupon_id = ? AND is_reversed = ?`, [couponId, false])
    const usages = await runQuery(`SELECT 
                                    u.id,
                                    u.user_id,
                                    u.used_at,
                                    o.id as order_id,
                                    o.total,
                                    o.discount_amount,
                                    o.final_total

                                    FROM coupon_usages u
                                JOIN orders o ON o.id = u.order_id
                                    WHERE u.coupon_id = ?
                                        AND u.is_reversed = ?
                                        AND o.status != ?
                                ORDER BY u.used_at DESC
                                LIMIT ?
                                OFFSET ?`
                            , [couponId, false, "cancelled", limit, offset]);

    // if (usages.length === 0) {
    //     return {usages: [], pages: 0, totalUsages: 0};
    // }

    const allUsages = {
        // usages: usages.map(item => (
        //     {...item, 
        //         total: (item.total).toFixed(2), 
        //         discount_amount: (item.discount_amount).toFixed(2), 
        //         final_total: (item.final_total).toFixed(2)
        //     })),
        usages,
        pages: Math.ceil (totalUsages / limit),
        totalUsages: totalUsages,
    }
    return allUsages
}

exports.updateCouponData = async (end_time, total_coupons, limit_per_user, id) => {
    const update = await runQuery(`UPDATE coupons SET end_time = ?, total_coupons = ?, limit_per_user = ? WHERE id = ?`, [end_time, total_coupons, limit_per_user, id])

    if(update.affectedRows === 0){
        throw new Error ("Could not update Coupon Data")
    }
}

exports.endCoupon = async (couponId) => {
    const updateStatus = await runQuery(`UPDATE coupons SET end_time = NOW(), is_active = 0 WHERE id = ?`, [couponId])

    if(updateStatus.affectedRows === 0){
        throw new Error ("Could not deactivate Coupon")
    }
}

exports.getCategories = async () => {
    const categories = await runQuery(`SELECT id, category FROM categories`)
    // console.log(categories);
    return categories
}

exports.getCouponCategories = async (couponId) => {
    const couponCategories = await runQuery(`SELECT
                                                cc.category_id AS id,
                                                c.category
                                            FROM coupon_categories cc
                                            JOIN categories c
                                                ON cc.category_id = c.id
                                                WHERE cc.coupon_id = ?
                                                `, [couponId]);
    // console.log(couponCategories);
    return couponCategories
}


exports.getCouponReport = async (couponId, fromTime, toTime) => {
    let [coupon] = await runQuery(`SELECT * FROM coupons WHERE id = ?`, [couponId])

    if(!coupon){
        throw new Error("Coupon does not exist")
    }

    const couponUsages = await runQuery(`SELECT 
                                            id,
                                            coupon_id,
                                            user_id,
                                            order_id,
                                            DATE_FORMAT(used_at, '%m/%d/%Y') as used_at
                                        FROM coupon_usages WHERE coupon_id = ? 
                                            AND (used_at BETWEEN ? AND ?)
                                            AND is_reversed = ?`, [couponId, fromTime, toTime, false]);

    const totalUsage = couponUsages.length

    const uniqueUsers = await runQuery(`SELECT 
                                            DISTINCT user_id 
                                        FROM coupon_usages 
                                        WHERE coupon_id = ? 
                                            AND (used_at BETWEEN ? AND ?)
                                            AND is_reversed = ?`, [couponId, fromTime, toTime, false])

    const uniqueUserIds = uniqueUsers.map(user => user.user_id)
    const totalUniqueUsers = uniqueUserIds.length

    const orders = await runQuery(`SELECT * FROM orders WHERE coupon_id = ? AND (order_date BETWEEN ? AND ?) AND status != ?`, [couponId, fromTime, toTime, "cancelled"])
    const orderIds = orders.map(item => item.id)
    const totalOrders = orderIds.length

    let orderItems = []

    if(coupon.applies_to === "product" && orderIds.length > 0){
        orderItems = await adminUtils.orderedItemsProductCoupon(couponId, orderIds)
    }

    if(coupon.applies_to === "category" && orderIds.length > 0){        
        orderItems = await adminUtils.orderedItemsCategoryCoupon(couponId, orderIds)
    }

    const [{totalLoss}] = await runQuery(`SELECT SUM(discount_amount) as totalLoss FROM orders WHERE coupon_id = ? AND (order_date BETWEEN ? AND ?) AND status != ?`, [couponId, fromTime, toTime, "cancelled"])
    const totalSales = parseFloat((orderItems.reduce((acc, value) => acc + value.total_purchase_price, 0)).toFixed(2))

    const [{totalGrossSales}] = await runQuery(`SELECT SUM(final_total) as totalGrossSales FROM orders WHERE coupon_id = ? AND (order_date BETWEEN ? AND ?) AND status != ?`, [couponId, fromTime, toTime, "cancelled"])

    const targetedAOV = parseFloat((totalSales/totalOrders).toFixed(2))
    const grossAOV = parseFloat((totalGrossSales/totalOrders).toFixed(2))

    return {totalUsage, totalUniqueUsers, totalLoss, totalSales, totalGrossSales, targetedAOV, grossAOV, fromTime, toTime}
}

exports.getCouponReportProducts = async (couponId, fromTime, toTime, limit, sortBy, orderBy) => {
    let products = [];
    let totalProductsSold = 0;
    let totalProductsDiscounts = 0;
    let totalProductsSales = 0;

    let orderItems = []

    let [coupon] = await runQuery(`SELECT * FROM coupons WHERE id = ?`, [couponId])
    if(!coupon){
        throw new Error("Coupon does not exist")
    }

    const orders = await runQuery(`SELECT * FROM orders WHERE coupon_id = ? AND (order_date BETWEEN ? AND ?) AND status != ?`, [couponId, fromTime, toTime, "cancelled"])
    const orderIds = orders.map(item => item.id)

    if(coupon.applies_to === "product" && orderIds.length > 0){
        orderItems = await adminUtils.orderedItemsProductCoupon(couponId, orderIds)
    }
    if(coupon.applies_to === "category" && orderIds.length > 0){
        orderItems = await adminUtils.orderedItemsCategoryCoupon(couponId, orderIds)
    }
    if (!orderItems || orderItems.length === 0) {        
        const productDetails = {products, totalProductsSold, totalProductsDiscounts, totalProductsSales}
        return productDetails
    }

    const productIds = orderItems.map(item => item.product_id)

    products = await runQuery(`SELECT 
                                    p.id,
                                    p.title,
                                    p.status,
                                    p.category_id,
                                    c.category,

                                    CASE
                                        WHEN pd.offer_price IS NOT NULL 
                                            THEN pd.offer_price
                                        ELSE pp.price
                                    END AS price
                                FROM products p
                                JOIN categories c
                                    ON c.id = p.category_id
                                JOIN product_pricing pp 
                                    ON pp.product_id = p.id
                                    AND NOW() BETWEEN pp.start_time AND pp.end_time

                                LEFT JOIN product_discounts pd 
                                    ON pd.product_id = p.id
                                    AND pd.is_active = 1
                                    AND pd.start_time <= NOW()
                                    AND pd.end_time > NOW()

                                WHERE p.id IN (?)
                                ORDER BY p.id ASC`, [productIds]);
                                // ORDER BY p.id ASC`, [productIds]);

    products = products.map(item => {
        let coupon_discount_amount = coupon.discount_type === "fixed"
                    ? coupon.discount_value
                    : (item.price/100) * coupon.discount_value

        if(coupon.threshold_amount && coupon_discount_amount > coupon.threshold_amount){
            coupon_discount_amount = coupon.threshold_amount 
        }

        const matchingOrderItem = orderItems.find(o => o.product_id === item.id);
        const total_quantity = matchingOrderItem ? matchingOrderItem.total_quantity : 0
        const total_purchase_price = matchingOrderItem ? matchingOrderItem.total_purchase_price : 0 

        const total_product_discount = coupon.discount_type === "percent"
                                ? Math.min(
                                        (total_purchase_price * coupon.discount_value) / (100 - coupon.discount_value),
                                        coupon.threshold_amount ? coupon.threshold_amount * total_quantity : Infinity
                                    )
                                : coupon.discount_value * total_quantity;

        // totalProductsSold += total_quantity
        // totalProductsDiscounts += total_product_discount
        // totalProductsSales += total_purchase_price
        return {
            ...item,
            coupon_discount_amount: coupon_discount_amount, 
            final_price: item.price - coupon_discount_amount,
            total_quantity,
            total_purchase_price,
            total_product_discount
        }
    })

    let newProducts = []
    if(orderBy === "asc"){
        newProducts = [...products].sort((a, b) => a[sortBy] - b[sortBy]).slice(0, limit); 
    }
    else{
        newProducts = [...products].sort((a, b) => b[sortBy] - a[sortBy]).slice(0, limit); 
    }
    for(item of newProducts){
        totalProductsSold += item.total_quantity
        totalProductsDiscounts += item.total_product_discount
        totalProductsSales += item.total_purchase_price
    }

    const productDetails = {products: newProducts, totalProductsSold, totalProductsDiscounts, totalProductsSales}
    return productDetails
}

exports.getCouponReportCategories = async (couponId, fromTime, toTime, limit, sortBy, orderBy) => {
    let products = [];

    let orderItems = []

    let totalCategoryProductsSold = 0;
    let totalCategoryProductsDiscounts = 0;
    let totalCategoryProductsSales = 0;

    let [coupon] = await runQuery(`SELECT * FROM coupons WHERE id = ?`, [couponId])
    if(!coupon){
        throw new Error("Coupon does not exist")
    }

    const orders = await runQuery(`SELECT * FROM orders WHERE coupon_id = ? AND (order_date BETWEEN ? AND ?) AND status != ?`, [couponId, fromTime, toTime, "cancelled"])
    const orderIds = orders.map(item => item.id)

    if(coupon.applies_to === "product" && orderIds.length > 0){
        orderItems = await adminUtils.orderedItemsProductCoupon(couponId, orderIds)
    }
    if(coupon.applies_to === "category" && orderIds.length > 0){
        orderItems = await adminUtils.orderedItemsCategoryCoupon(couponId, orderIds)
    }
    if (!orderItems || orderItems.length === 0) {        
        const categoryDetails = {categories: [], totalCategoryProductsSold, totalCategoryProductsDiscounts, totalCategoryProductsSales}
        return categoryDetails
    }

    const productIds = orderItems.map(item => item.product_id)

    products = await runQuery(`SELECT 
                                    p.id,
                                    p.title,
                                    p.status,
                                    p.category_id,
                                    c.category,

                                    CASE
                                        WHEN pd.offer_price IS NOT NULL 
                                            THEN pd.offer_price
                                        ELSE pp.price
                                    END AS price
                                FROM products p
                                JOIN categories c
                                    ON c.id = p.category_id
                                JOIN product_pricing pp 
                                    ON pp.product_id = p.id
                                    AND NOW() BETWEEN pp.start_time AND pp.end_time

                                LEFT JOIN product_discounts pd 
                                    ON pd.product_id = p.id
                                    AND pd.is_active = 1
                                    AND pd.start_time <= NOW()
                                    AND pd.end_time > NOW()

                                WHERE p.id IN (?)
                                ORDER BY p.id ASC`, [productIds]);
                                // ORDER BY p.id ASC`, [productIds]);

    products = products.map(item => {
        let coupon_discount_amount = coupon.discount_type === "fixed"
                    ? coupon.discount_value
                    : (item.price/100) * coupon.discount_value

        if(coupon.threshold_amount && coupon_discount_amount > coupon.threshold_amount){
            coupon_discount_amount = coupon.threshold_amount 
        }

        const matchingOrderItem = orderItems.find(o => o.product_id === item.id);
        const total_quantity = matchingOrderItem ? matchingOrderItem.total_quantity : 0
        const total_purchase_price = matchingOrderItem ? matchingOrderItem.total_purchase_price : 0 

        const total_product_discount = coupon.discount_type === "percent"
                                ? Math.min(
                                        (total_purchase_price * coupon.discount_value) / (100 - coupon.discount_value),
                                        coupon.threshold_amount ? coupon.threshold_amount * total_quantity : Infinity
                                    )
                                : coupon.discount_value * total_quantity;
        return {
            ...item,
            coupon_discount_amount: coupon_discount_amount, 
            final_price: item.price - coupon_discount_amount,
            total_quantity,
            total_purchase_price,
            total_product_discount
        }
    })

    mapProductCategories = products.reduce((acc, item) => {
        const cat = item.category;

        if (!acc[cat]) {
            acc[cat] = {
                id: item.category_id,
                category: cat,
                total_quantity: 0,
                total_purchase_price: 0,
                total_product_discount: 0
            };
        }

        acc[cat].total_quantity += item.total_quantity;
        acc[cat].total_purchase_price += item.total_purchase_price;
        acc[cat].total_product_discount += item.total_product_discount;

        // totalCategoryProductsSold += item.total_quantity
        // totalCategoryProductsSales += item.total_purchase_price
        // totalCategoryProductsDiscounts += item.total_product_discount

        return acc;
    }, {});

    const categories = Object.values(mapProductCategories)

    let newCategories = []
    if(orderBy === "asc"){
        newCategories = [...categories].sort((a, b) => a[sortBy] - b[sortBy]).slice(0, limit);
    }
    else{
        newCategories = [...categories].sort((a, b) => b[sortBy] - a[sortBy]).slice(0, limit); 
    }
    for(item of newCategories){
        totalCategoryProductsSold += item.total_quantity
        totalCategoryProductsDiscounts += item.total_product_discount
        totalCategoryProductsSales += item.total_purchase_price
    }

    const categoryDetails = {categories: newCategories, totalCategoryProductsSold, totalCategoryProductsDiscounts, totalCategoryProductsSales}
    return categoryDetails
}

exports.getCouponReportUsers = async (couponId, fromTime, toTime, limit, sortBy, orderBy) => {
    let users = [];
    let totalUserRedeems = 0;
    let totalUserDiscount = 0;
    let totalUserSales = 0;

    let [coupon] = await runQuery(`SELECT * FROM coupons WHERE id = ?`, [couponId])
    if(!coupon){
        throw new Error("Coupon does not exist")
    }

    const orders = await runQuery(`SELECT * FROM orders WHERE coupon_id = ? AND (order_date BETWEEN ? AND ?) AND status != ?`, [couponId, fromTime, toTime, "cancelled"])

    // const orders = await runQuery(`SELECT orders.*, COUNT(orders.id) AS total_redeems FROM orders WHERE coupon_id = ? AND (order_date BETWEEN ? AND ?)`, [couponId, fromTime, toTime])
    // console.log(orders);
    
    const orderIds = orders.map(item => item.id)

    if (!orders || orders.length === 0) {
        const userDetails = {users, totalUserRedeems, totalUserDiscount, totalUserSales}
        return userDetails
    }

    if(coupon.applies_to === "all"){
        // const groupedUsers = orders.reduce((acc, item) => {
        //     const userId = item.user_id;
    
        //     if (!acc[userId]) {
        //         acc[userId] = {
        //             user_id: userId,
        //             total_redeems: 0,
        //             total_discount: 0,
        //             total_sales: 0
        //         };
        //     }
    
        //     acc[userId].total_redeems += 1;
        //     acc[userId].total_discount += item.discount_amount;
        //     acc[userId].total_sales += item.final_total;
    
        //     totalUserRedeems += 1
        //     totalUserDiscount += item.discount_amount
        //     totalUserSales += item.final_total
    
        //     return acc;
        // }, {})
        
        const groupedUsers = await runQuery(`SELECT 
                                                o.user_id,
                                                COUNT(o.id) AS total_redeems,
                                                SUM(discount_amount) AS total_discount,
                                                SUM(final_total) AS total_sales
                                            FROM orders o
                                            WHERE o.coupon_id = ?
                                                AND o.order_date BETWEEN ? AND ?
                                                AND o.status != ?
                                            GROUP BY o.user_id`, [couponId, fromTime, toTime, "cancelled"])

        users = Object.values(groupedUsers)
        // const userDetails = {users, totalUserRedeems, totalUserDiscount, totalUserSales}
    
        // return userDetails
        // return {users, totalUserRedeems, totalUserDiscount, totalUserSales}
    }

    if(orderIds && orderIds.length > 0 && coupon.applies_to === 'product'){
        const groupedUsers = await runQuery(`SELECT
                                                user_id,
                                                COUNT(order_id) AS total_redeems,
                                                SUM(total_sales) AS total_sales,
                                                SUM(total_discount) AS total_discount
                                            FROM (
                                                SELECT 
                                                    o.user_id,
                                                    o.id AS order_id,
                                                    COUNT(DISTINCT o.id) AS total_redeems,
                                                    SUM(oi.purchase_price * oi.quantity) AS total_sales,
                                                    o.discount_amount AS total_discount
                                                FROM orders o
                                                JOIN order_item oi ON oi.order_id = o.id
                                                JOIN (
                                                        SELECT DISTINCT product_id 
                                                        FROM coupon_products
                                                        WHERE coupon_id = ?
                                                    ) cp ON 
                                                    cp.product_id = oi.product_id
                                                WHERE o.id IN (?)
                                                GROUP BY o.id
                                            ) sub
                                            GROUP BY user_id`,[couponId, orderIds]);

        users = Object.values(groupedUsers)
        // for(item of groupedUsers){
        //     totalUserDiscount += item.total_discount
        //     totalUserRedeems += item.total_redeems
        //     totalUserSales += item.total_sales
        // }
    }

    if(orderIds && orderIds.length > 0 && coupon.applies_to === 'category'){
        const groupedUsers = await runQuery(`SELECT 
                                                user_id,
                                                COUNT(order_id) AS total_redeems,
                                                SUM(total_sales) AS total_sales,
                                                SUM(total_discount) AS total_discount
                                            FROM (
                                                SELECT 
                                                    o.user_id,
                                                    o.id AS order_id,
                                                    SUM(oi.purchase_price * oi.quantity) AS total_sales,
                                                    o.discount_amount AS total_discount
                                                FROM orders o
                                                JOIN order_item oi ON oi.order_id = o.id
                                                JOIN products p ON p.id = oi.product_id
                                                JOIN (
                                                    SELECT DISTINCT category_id 
                                                    FROM coupon_categories
                                                    WHERE coupon_id = ?
                                                ) cc ON cc.category_id = p.category_id
                                                WHERE o.id IN (?)
                                                GROUP BY o.id
                                            ) sub
                                            GROUP BY user_id;`,[couponId, orderIds]);

        // console.log(groupedUsers);
        users = Object.values(groupedUsers)

        // for(item of groupedUsers){
        //     totalUserDiscount += item.total_discount
        //     totalUserRedeems += item.total_redeems
        //     totalUserSales += item.total_sales
        // }
    }

    let newUsers = []
    if(orderBy === "asc"){
        newUsers = [...users].sort((a, b) => a[sortBy] - b[sortBy]).slice(0, limit);
    }
    else{
        newUsers = [...users].sort((a, b) => b[sortBy] - a[sortBy]).slice(0, limit); 
    }
    for(item of newUsers){
        totalUserRedeems += item.total_redeems
        totalUserDiscount += item.total_discount
        totalUserSales += item.total_sales
    }

    const userDetails = {users: newUsers, totalUserRedeems, totalUserDiscount, totalUserSales}
    return userDetails
}

exports.getCouponReportDates = async (couponId, fromTime, toTime, limit, sortBy, orderBy) => {
    // const couponUsages = await runQuery(`SELECT 
    //                                             id,
    //                                             coupon_id,
    //                                             user_id,
    //                                             order_id,
    //                                             DATE_FORMAT(used_at, '%m/%d/%Y') as used_at
    //                                         FROM coupon_usages WHERE coupon_id = ? AND (used_at BETWEEN ? AND ?)`, [couponId, fromTime, toTime]);

    // let totalDateRedeems = 0;
    // groupedDateUsages = Object.values(
    //     couponUsages.reduce((acc, item) => {
    //         const date = item.used_at;

    //         if (!acc[date]) {
    //             acc[date] = {
    //                 id: date,
    //                 date: dayjs(date),
    //                 total_redeems: 0,
    //             };
    //         }

    //         acc[date].total_redeems += 1;

    //         totalDateRedeems += 1
    //         return acc;
    //     }, {})
    // );

    const order = orderBy === `asc` ? `ASC` : `DESC`

    const groupedDateUsages = await runQuery(`SELECT 
                                    DATE_FORMAT(used_at, '%m/%d/%Y') AS id,
                                    DATE_FORMAT(used_at, '%m/%d/%Y') AS date,
                                    COUNT(*) AS total_redeems
                                FROM coupon_usages
                                WHERE coupon_id = ?
                                    AND used_at BETWEEN ? AND ?
                                    AND is_reversed = ?
                                GROUP BY DATE_FORMAT(used_at, '%m/%d/%Y')
                                ORDER BY total_redeems ${order}`, [couponId, fromTime, toTime, false]);
                                // ORDER BY STR_TO_DATE(date, '%m/%d/%Y') ${order}`, [couponId, fromTime, toTime]);
    // console.log(groupedDateUsages);

    const totalDateRedeems = groupedDateUsages.reduce((sum, row) => sum + row.total_redeems, 0);

    // let newUsers = []
    // if(orderBy === "asc"){
    //     newUsers = [...users].sort((a, b) => a[sortBy] - b[sortBy]).slice(0, limit);
    // }
    // else{
    //     newUsers = [...users].sort((a, b) => b[sortBy] - a[sortBy]).slice(0, limit); 
    // }
    // for(item of newUsers){
    //     totalUserRedeems += item.total_redeems
    //     totalUserDiscount += item.total_discount
    //     totalUserSales += item.total_sales
    // }

    return {dates: groupedDateUsages, totalDateRedeems}
}

exports.getFirstBasicTemplate = async () => {
    const basicTemplatePath = path.join(__dirname, "../mailer/templates", "basic.hbs")

    const basicTemplateData = await fs.readFile(basicTemplatePath, 'utf-8')

    // console.log(basicTemplateData);
    return basicTemplateData
}

exports.getAllTemplateFiles = async (username, active) => {
    console.log(username, active);
    
    const adminTemplatesDir = path.join(__dirname, "../mailer/adminTemplates", username)

    const templatesExist = await fs.pathExists(adminTemplatesDir)

    if(!templatesExist){
        await this.addNewTemplateFile(username, "first_template")
    }

    const dirContents = await fs.readdir(adminTemplatesDir)
    console.log(dirContents);

    if(dirContents.length === 0){
        return {files: {}}
    }

    const files = {}
    for(let file of dirContents){
        const woExt = file.replace(path.extname(file), "")
        files[woExt] = ""
    }

    if(active === "any"){
        const firstFile = dirContents[0]
        const firstFilePath = path.join(adminTemplatesDir, firstFile)
        const firstFileContent = await fs.readFile(firstFilePath, 'utf-8')

        files[firstFile.replace(".hbs", "")] = firstFileContent
        return {files}
    }
    else{
        const activeFile = active + ".hbs"
        const activeFilePath = path.join(adminTemplatesDir, activeFile)
        const activeFileContent = await fs.readFile(activeFilePath, 'utf-8')

        files[activeFile.replace(".hbs", "")] = activeFileContent
        return {files}
    }
}

exports.addNewTemplateFile = async (username, fileName, extension = ".hbs") => {

    console.log(username, fileName, extension);
    

    const adminTemplatesDir = path.join(__dirname, "../mailer/adminTemplates", username)

    await fs.ensureDir(adminTemplatesDir)

    const newFilePath = path.join(adminTemplatesDir, fileName.trim() + extension.trim())
    const newFileContent = await this.getFirstBasicTemplate()
    await fs.outputFile(newFilePath, newFileContent)
}