const dayjs = require("dayjs");
const runQuery = require("../db");
const { sendMail } = require("../mailer/sendMail");
const walletService = require("./walletService")
const adminServices = require("./adminServices")
const client = require('../elastic-client');

exports.addOrder = async(userId, order, coupon) => {
    const checkCart = await runQuery(`SELECT 
                                        * 
                                    FROM cart 
                                    WHERE user_id = ? 
                                        AND status = 'active'`, [userId]);
    if (checkCart.length === 0) {
        throw new Error("No active cart found");
    }
    const cartId = checkCart[0].id; 

    const [{totalOrders}] = await runQuery(`SELECT COUNT(id) as totalOrders FROM orders WHERE user_id = ?`, [userId])
    console.log(totalOrders);

    let isReferral = false
    if(totalOrders === 0){
        isReferral = await this.checkReferral(userId)
    }

    const itemsToOrder = await runQuery(`SELECT 
                                            ci.product_id, 
                                            ci.quantity
                                        FROM cart_item ci
                                        WHERE ci.user_id = ? 
                                            AND ci.cart_id = ?`, [userId, cartId]);

    const freeShippingApplicable = order.cartValue >= 50 ? true : false
    const shippingCharges = freeShippingApplicable ? 0.00 : 4.99
    const userWallet = await walletService.getWallet(userId)
    const currentCartValue = order.newCartValue ? order.newCartValue : order.cartValue
    const isBalanceSufficient = await walletService.compareBalance(userWallet, parseFloat((currentCartValue + shippingCharges).toFixed(2)))

    if(!isBalanceSufficient){
        throw new Error("Insufficient balance in Wallet")
    }

    for (const item of itemsToOrder) {
        const [checkStock] = await runQuery(`SELECT stock FROM product_inventory WHERE product_id =?`, [item.product_id]);

        if (!checkStock || checkStock.stock === undefined) {
            throw new Error(`Inventory not found for Product ID: ${item.product_id}`);
        }

        if(checkStock.stock < item.quantity){
            throw new Error(`Insufficient stock for Product ID: ${item.product_id}`)
        }
    }

    let orderId;
    // make this stock update modular, so won't have to execute outside the conditions
    for (const item of itemsToOrder) {
        const updateStock = await runQuery(
            `UPDATE product_inventory SET stock = stock - ? WHERE product_id = ?`, [item.quantity, item.product_id]
        )

        await client.update({
            index: "products-search",
            id: item.product_id.toString(),
            body: {
                script: {
                    source: "ctx._source.stock -= params.decrement",
                    lang: "painless",
                    params: {
                        decrement: item.quantity
                    }
                }
            }
        })

        if(updateStock.affectedRows === 0){
            throw new Error(`Could not Update Quantity for Product ID: ${item.product_id}`)
        }
    }

    let orderItems = []
    if(coupon.code){
        const {newCart, couponData} = await this.checkCouponCode(userId, coupon.code)
        // console.log(currentCartValue, newCart.newCartValue);
        if(currentCartValue !== newCart.newCartValue){
            throw new Error("Cart value mismatch")
        }

        const insert = await runQuery("INSERT INTO orders (user_id, subtotal) VALUES (?, 0)", [userId]);
        if (insert.affectedRows === 0) {
            throw new Error("Couldn't insert Order");
        }
        orderId = insert.insertId;

        orderItems = newCart.items.map(item => {
            if(item.coupon_discount && item.coupon_discount > 0){
                const discount_amount = item.coupon_discount/item.quantity
                const item_price = item.price - discount_amount
                return {product_id: item.id, quantity: item.quantity, purchase_price: parseFloat((item_price).toFixed(2)), discount_amount, selling_price: item.price}
            }
            else{
                return {product_id: item.id, quantity: item.quantity, purchase_price: item.price, discount_amount: 0, selling_price: item.price}
            }
        })

        for(let i = 0; i < orderItems.length; i++){
            // console.log(orderItems[i].product_id, orderItems[i].quantity, orderItems[i].purchase_price);
            await runQuery(`INSERT INTO order_item (order_id, product_id, quantity, purchase_price, discount_amount, selling_price) VALUES (?, ?, ?, ?, ?, ?)`, [orderId,orderItems[i].product_id, orderItems[i].quantity, orderItems[i].purchase_price, orderItems[i].discount_amount, orderItems[i].selling_price])
        }

        const updateDiscount = await runQuery(`UPDATE orders SET 
                                                    subtotal = ?,
                                                    coupon_id = ?, 
                                                    coupon_code = ?,
                                                    discount_amount = ?,
                                                    shipping = ?
                                                    WHERE id = ?`,
            [newCart.cartValue, couponData.id, couponData.code, newCart.discountValue, shippingCharges, orderId]);
        if (updateDiscount.affectedRows === 0) {
            throw new Error("Couldn't update Total");
        }

        const couponUsage = await runQuery(`INSERT INTO coupon_usages (coupon_id, user_id, order_id) VALUES (?, ?, ?)`, [couponData.id, userId, orderId])

        const couponUsed = await runQuery(`UPDATE coupons SET times_used = times_used + ? WHERE id = ?`, [1, couponData.id])
    }

    else{
        const insert = await runQuery("INSERT INTO orders (user_id, subtotal) VALUES (?, 0)", [userId]);
        if (insert.affectedRows === 0) {
            throw new Error("Couldn't insert Order");
        }
        orderId = insert.insertId;

        const insertItem = await runQuery(`
            INSERT INTO order_item (order_id, product_id, quantity, purchase_price, selling_price) 
            SELECT 
                ?, 
                ci.product_id, 
                ci.quantity, 
                CASE 
                    WHEN pd.offer_price IS NOT NULL 
                        THEN pd.offer_price
                    ELSE pp.price
                END AS purchase_price,
                CASE 
                    WHEN pd.offer_price IS NOT NULL 
                        THEN pd.offer_price
                    ELSE pp.price
                END AS selling_price

            FROM cart_item ci 
            JOIN product_pricing pp 
                ON ci.product_id = pp.product_id
                AND NOW() BETWEEN pp.start_time AND pp.end_time

            LEFT JOIN product_discounts pd
                ON pd.product_id = ci.product_id
                AND pd.is_active = 1
                AND (pd.start_time IS NULL OR pd.start_time <= NOW())
                AND (pd.end_time IS NULL OR pd.end_time > NOW())
            WHERE ci.user_id = ? AND ci.cart_id = ?
            `,[orderId, userId, cartId]);

        if (insertItem.affectedRows === 0) {
            throw new Error("Couldn't insert Order Item");
        }

        const setTotal = await runQuery(`UPDATE orders
                SET subtotal = (
                    SELECT SUM(quantity * purchase_price)
                    FROM order_item
                    WHERE order_id = ?
                ),
                shipping = ?
                WHERE id = ?`,
            [orderId, shippingCharges, orderId]);
        if (setTotal.affectedRows === 0) {
            throw new Error("Couldn't update Total");
        }
    }

    const orderStatus = await runQuery(`INSERT INTO order_status_history (order_id, status, notes) VALUES (?, ?, ?)`, [orderId, 'pending', 'order placed'])

    await walletService.orderWalletPayment(userWallet, orderId, parseFloat((currentCartValue + shippingCharges).toFixed(2)))
    // await walletService.withdrawAmount(userWallet, currentCartValue, "PAYMENT")

    const emptyCart = await runQuery(`DELETE FROM cart_item WHERE cart_id = ?`, [cartId])

    if(isReferral){
        this.giveReferralReward(isReferral)
    }

    this.sendOrderEmail(userId, orderId, order, coupon)
}

exports.getOrdersService = async (userId, queryParams) => {

    const {
        page,
        limit,
        offset,
        dateOption,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        orderBy,
        sortBy,
        status
    } = queryParams;

    let whereClause = ` WHERE user_id = ?`
    let orderByClause = ""
    const params = [userId]
    const countQueryParams = [userId];

    if (sortBy) {
        if (sortBy === "date") orderByClause = " ORDER BY order_date";
        else if (sortBy === "amount") orderByClause = " ORDER BY final_total";
    }

    if (orderBy && orderByClause) {
        const dir = String(orderBy).toUpperCase() === "DESC" ? "DESC" : "ASC";
        orderByClause += ` ${dir}`;
    }

    if(dateOption && dateOption !== "custom"){
        if(dateOption === "last7days"){
            const day = dayjs().startOf('day').subtract(7, 'day').format("YYYY-MM-DD HH:mm:ss")
            whereClause += ` AND order_date >= ?`;
            params.push(day);
            countQueryParams.push(day)
        }

        if(dateOption === "last3months"){
            const day = dayjs().startOf('day').subtract(3, 'month').format("YYYY-MM-DD HH:mm:ss")
            whereClause += ` AND order_date >= ?`;
            params.push(day);
            countQueryParams.push(day)
        }

        if(dateOption === "thisYear"){
            const day = dayjs().startOf('year').format("YYYY-MM-DD HH:mm:ss")
            whereClause += ` AND order_date >= ?`;
            params.push(day);
            countQueryParams.push(day)
        }
    }

    if(dateOption === "custom" && startDate && endDate){
        const start = dayjs(startDate).format("YYYY-MM-DD HH:mm:ss")
        const end = dayjs(endDate).format("YYYY-MM-DD HH:mm:ss")
        whereClause += ` AND order_date BETWEEN ? AND ?`;
        params.push(start, end);
        countQueryParams.push(start, end)
    }

    if(minAmount){
        whereClause += ` AND final_total >= ?`;
        params.push(minAmount);
        countQueryParams.push(minAmount)
    }

    if(maxAmount){
        whereClause += ` AND final_total <= ?`;
        params.push(maxAmount);
        countQueryParams.push(maxAmount)
    }

    if(status && status !== "All"){
        whereClause += ` AND status = ?`;
        params.push(status);
        countQueryParams.push(status)
    }

    params.push(Number(limit) || 10, Number(offset) || 0);

    const limitedOrders = await runQuery(`SELECT id FROM orders ${whereClause} ${orderByClause} LIMIT ? OFFSET ?`,params)

    const [{totalFiltered}] = await runQuery(`SELECT COUNT(id) as totalFiltered FROM orders ${whereClause} ${orderByClause}`,params)

    const [{total}] = await runQuery(`SELECT COUNT(id) as total FROM orders WHERE user_id = ?`,[userId])

    if(limitedOrders.length === 0){
        console.error("No Orders Exist 1");
        return {
            orders: [],
            currentPage : page,
            pages: Math.ceil (totalFiltered / limit),
            totalFiltered,
            total
        }
    }

    const orderIds = limitedOrders.map(order => order.id)

    // const getOrders = await runQuery(
    //     `SELECT
    //         o.id AS order_id,
    //         o.total,
    //         o.discount_amount,
    //         o.final_total,
    //         o.status,
    //         SUM(oi.quantity) AS noOfItems,
    //         JSON_ARRAYAGG(
    //             JSON_OBJECT(
    //                 'id', p.id,
    //                 'quantity', oi.quantity,
    //                 'price', oi.purchase_price,
    //                 'title', p.title,
    //                 'brand', p.brand,
    //                 'thumbnail', p.thumbnail,
    //                 'rating', p.rating,
    //                 'category', c.category
    //             )
    //         ) AS items
    //     FROM orders o
    //     JOIN order_item oi ON o.id = oi.order_id
    //     JOIN products p   ON oi.product_id = p.id
    //     JOIN categories c ON c.id = p.category_id
    //     WHERE o.id IN (?)
    //     GROUP BY o.id
    //     ORDER BY FIELD(o.id, ?)`,
    //     [orderIds, orderIds]
    // );

    const getOrders = await this.getOrdersByIdsHelper(orderIds)

    if (getOrders.length === 0) {
        console.error("Cannot fetch orders");
        return {};
    }

    const orders = getOrders.map(order => ({
        order_id: order.order_id,
        noOfItems: order.noOfItems,
        items: order.items,
        final_total: order.final_total,
        cartValue: order.subtotal,
        discount: order.discount_amount,
        status: order.status
    }));


    return {
        orders,
        currentPage: page,
        pages: Math.ceil(totalFiltered / limit),
        totalFiltered,
        total
    };
}


exports.checkCouponCode = async (userId, code) => {
    // console.log(code);

    const [coupon] = await runQuery(`SELECT * FROM coupons WHERE code = ? AND is_active = ?`, [code, 1])

    if(!coupon){
        throw new Error("This coupon does not exist")
    }

    if(coupon.coupons_left !== null && coupon.coupons_left <= 0){
        throw new Error("This coupon has reached its usage limit and is no longer valid")
    }

    if(coupon.for_new_users_only){
        const checkOrders = await runQuery(`SELECT * FROM orders WHERE user_id = ?`, [userId])
        // console.log(checkOrders.length);
        if(checkOrders.length > 0){
            throw new Error("Coupon applicable for First Order only")
        }
    }

    const checkUsage = await runQuery(`SELECT * FROM coupon_usages WHERE coupon_id = ? AND user_id = ?`, [coupon.id, userId])
    // console.log(checkUsage.length);
    if(coupon.limit_per_user && checkUsage.length >= coupon.limit_per_user){
        throw new Error("You've already used this coupon the maximum number of times")
    }

    const [checkActiveCart] = await runQuery(`SELECT * FROM cart WHERE user_id = ? AND status = ?`, [userId, 'active'])

    if(!checkActiveCart){
        throw new Error("Your cart seems to be empty or inactive. Please add items and try again")
    }
    const cartId = checkActiveCart.id

    let productIds = []
    if(coupon.applies_to === "product"){
        const getCouponProducts = await runQuery(`SELECT product_id FROM coupon_products WHERE coupon_id = ?`,[coupon.id])
        productIds = getCouponProducts.map(product => product.product_id)

        const getCartProducts = await runQuery(`SELECT * FROM cart_item WHERE cart_id = ? AND user_id = ?`, [cartId, userId])
        const products = getCartProducts.map(product => product.product_id)

        const applicableProducts = productIds.filter(id => products.includes(id))

        if(applicableProducts.length < 1){
            throw new Error("This coupon is not applicable to any of the products in your cart");
        }
    }

    let categoryIds = []
    if(coupon.applies_to === "category"){

        if (coupon.applies_to === "category" && coupon.discount_type !== "percent") {
            throw new Error("Only percentage-based discounts are allowed for category coupons");
        }

        const getCouponCategories = await runQuery(`SELECT category_id FROM coupon_categories WHERE coupon_id = ?`,[coupon.id])
        categoryIds = getCouponCategories.map(category => category.category_id)
        // console.log(categoryIds);

        const getCartCategories = await runQuery(`SELECT
                                                    ci.product_id,
                                                    p.category_id
                                                    FROM 
                                                    cart_item ci
                                                    JOIN products p
                                                        ON ci.product_id = p.id
                                                    WHERE cart_id = ? 
                                                        AND user_id = ?`, [cartId, userId])
        const cartCategories = getCartCategories.map(product => product.category_id)
        // console.log(cartCategories);

        const applicableProducts = categoryIds.filter(id => cartCategories.includes(id))
        // console.log(applicableProducts);

        if(applicableProducts.length < 1){
            throw new Error("This coupon is not applicable to any of the products in your cart");
        }
    }

    const couponData = {...coupon, products : [...productIds], categories: [...categoryIds]}


    const getProducts = await runQuery(`SELECT 
                                            p.*,
                                            c.id AS cid,
                                            c.category,
                                            ci.quantity,
                                            pp.mrp, 
                                            pp.discount, 
                                            i.stock,
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
                                            END AS price,
                                            CASE
                                                WHEN pd.offer_price IS NOT NULL 
                                                    THEN pd.offer_price
                                                ELSE pp.price
                                            END * ci.quantity AS priceValue
                                        FROM cart_item ci
                                        JOIN products p
                                            ON ci.product_id = p.id
                                        JOIN categories c
                                            ON c.id = p.category_id
                                        JOIN product_inventory i 
                                            ON p.id = i.product_id 
                                        JOIN product_pricing pp 
                                            ON pp.product_id = p.id 
                                            AND NOW() BETWEEN pp.start_time AND pp.end_time
                                        LEFT JOIN product_discounts pd
                                            ON pd.product_id = p.id
                                            AND pd.is_active = 1
                                            AND (pd.start_time IS NULL OR pd.start_time <= NOW())
                                            AND (pd.end_time IS NULL OR pd.end_time > NOW())
                                        WHERE ci.cart_id = ?
                                            AND ci.user_id = ?`, [cartId, userId]);

    if(getProducts.length <= 0){
        throw new Error("Your cart seems to be empty or inactive. Please add items and try again")
    }

    const noOfItems = getProducts.reduce((accumulator, currentValue) => accumulator + currentValue.quantity, 0,)
    const cartValue = getProducts.reduce((accumulator, currentValue) => accumulator + currentValue.price * currentValue.quantity, 0,)
    const cart = {items : getProducts, noOfItems, cartValue: parseFloat((cartValue).toFixed(2))}

    let discountValue = 0;

    switch (couponData.applies_to) {
        case 'all':
            if (cart.cartValue >= couponData.min_cart_value) {
                discountValue = couponData.discount_type === 'percent'
                    ? cart.cartValue * (couponData.discount_value / 100)
                    : couponData.discount_value;
                if (couponData.threshold_amount && discountValue > couponData.threshold_amount) {
                    discountValue = couponData.threshold_amount;
                }
            }
            else{
                throw new Error("Insufficient Cart Value")
            }
            break;

        case 'product':
            cart.items.forEach((item) => {
                if (couponData.products.includes(item.id)) {
                    let productDiscount = couponData.discount_type === 'percent'
                        ? item.price * item.quantity * (couponData.discount_value / 100)
                        : couponData.discount_value * item.quantity;
                    // discountValue += Math.min(productDiscount, couponData.threshold_amount) // wont work if threshold null or undefined

                    // if (couponData.threshold_amount && productDiscount > couponData.threshold_amount) {
                    //     productDiscount = couponData.threshold_amount;
                    //     discountValue += couponData.threshold_amount
                    // }
                    // else{
                    //     discountValue += productDiscount
                    // }

                    const maxAllowedDiscount = couponData.threshold_amount ? (couponData.threshold_amount * item.quantity) : Infinity;
                    if (productDiscount > maxAllowedDiscount) {
                        productDiscount = maxAllowedDiscount;
                    }
                    discountValue += productDiscount;

                    item.coupon_discount = parseFloat((productDiscount).toFixed(2))
                }
            });
            break;

        case 'category':
            cart.items.forEach((item) => {
                if (couponData.categories.includes(item.cid)) {
                    let productDiscount = couponData.discount_type === 'percent'
                        ? item.price * item.quantity * (couponData.discount_value / 100)
                        : 0

                    // if (couponData.threshold_amount && productDiscount > couponData.threshold_amount) {
                    //     productDiscount = couponData.threshold_amount;
                    //     discountValue += couponData.threshold_amount
                    // }
                    // else{
                    //     discountValue += productDiscount
                    // }

                    const maxAllowedDiscount = couponData.threshold_amount ? (couponData.threshold_amount * item.quantity) : Infinity;
                    if (productDiscount > maxAllowedDiscount) {
                        productDiscount = maxAllowedDiscount;
                    }

                    discountValue += productDiscount;
                    item.coupon_discount = parseFloat((productDiscount).toFixed(2))
                }
            });
            break;

        default:
            throw new Error('Unsupported coupon type');
    }

    // if (couponData.threshold_amount && discountValue > couponData.threshold_amount) {
    //     discountValue = couponData.threshold_amount;
    // }

    const newCart = {...cart, discountValue: parseFloat((discountValue).toFixed(2)), newCartValue: parseFloat((cart.cartValue - discountValue).toFixed(2))}

    if(newCart.discountValue >= newCart.cartValue || newCart.newCartValue <= 0){
        throw new Error("Insufficient Cart Value")
    }

    return {newCart, couponData} // Manage what to send on frontend, revealing coupons left and for new users only
}

exports.sendOrderEmail = async (userId, orderId, order, coupon) => {
    const [userDetails] = await runQuery(`SELECT * FROM users WHERE id = ?`, [userId])

    let couponCode = "";
    if(coupon.code){
        couponCode = coupon.code.toUpperCase()
    }

    try{
        await sendMail({
            to: userDetails.email,
            subject: "Your Cartify Order has been successfully placed",
            template: "order-confirmation.hbs",
            replacements:
                {
                    fName : userDetails.first_name, 
                    noOfItems: order.noOfItems,
                    orderDate: dayjs().format("DD MMM YYYY, HH:mm a"), 
                    orderId,
                    items: order.items,
                    cartValue: order.cartValue,
                    discountValue: order.discountValue,
                    couponCode,
                    newCartValue: order.newCartValue,
                    orderLink: "http://localhost:5173/my-orders"
                }
        })
    }
    catch(err){
        console.error("Failed to send order confirmation email:", err);
    }
}

exports.orderRefundByUser = async (orderId, userId, reason = "") => {
    await adminServices.orderRefund(orderId, userId, reason, "user")
}

exports.checkReferral = async (userId) => {
    const [checkReferral] = await runQuery(`SELECT * FROM referral_uses WHERE referee_id = ? AND accepted = ? AND reward_status = ?`, [userId, 1, "pending"])

    if(!checkReferral){
        return false
    }

    return checkReferral
}

exports.giveReferralReward = async (referralData) => {
    const reward_amount = 10
    const referrerWallet = await walletService.getWallet(referralData.referrer_id)

    try{
        if(referralData.status === "credited") return
        await walletService.addAmount(referrerWallet, reward_amount, "REFERRAL_REWARD", null, `referral_order/refereeId:${referralData.referee_id}`)

        await runQuery(`UPDATE referral_uses SET reward_status = ?, reward_amount = ? WHERE id = ?`, ["credited", reward_amount, referralData.id])
    }
    catch(err){
        await runQuery(`UPDATE referral_uses SET reward_status = ?, reward_amount = ? WHERE id = ?`, ["failed", reward_amount, referralData.id])
    }
}

exports.getSingleOrderData = async (userId, orderId) => {
    const [user] = await runQuery(`
        SELECT
            first_name,
            last_name,
            addLine1,
            addLine2,
            state,
            city,
            pincode,
            number,
            email
        FROM
        users
        WHERE id = ?
        `, [userId])

    // const [order] = await runQuery(
    //     `SELECT
    //         o.id AS order_id,
    //         o.subtotal,
    //         o.discount_amount,
    //         o.shipping,
    //         o.final_total,
    //         o.status,
    //         o.order_date,
    //         o.last_updated,
    //         SUM(oi.quantity) AS noOfItems,
    //         JSON_ARRAYAGG(
    //             JSON_OBJECT(
    //                 'id', p.id,
    //                 'quantity', oi.quantity,
    //                 'purchase_price', oi.purchase_price,
    //                 'selling_price', oi.selling_price,
    //                 'discount_amount', oi.discount_amount,
    //                 'title', p.title,
    //                 'brand', p.brand,
    //                 'thumbnail', p.thumbnail,
    //                 'rating', p.rating,
    //                 'category', c.category
    //             )
    //         ) AS items,
    //         CASE 
    //             WHEN o.coupon_id IS NOT NULL 
    //                 THEN 
    //                     JSON_OBJECT(
    //                         'id', cp.id,
    //                         'name', cp.name,
    //                         'code', cp.code,
    //                         'discount_type', cp.discount_type,
    //                         'discount_value', cp.discount_value,
    //                         'threshold_amount', cp.threshold_amount,
    //                         'applies_to', cp.applies_to
    //                     )
    //             ELSE NULL
    //         END AS coupon
    //     FROM orders o
    //     JOIN order_item oi 
    //         ON o.id = oi.order_id
    //     JOIN products p 
    //         ON oi.product_id = p.id
    //     JOIN categories c 
    //         ON c.id = p.category_id
    //     LEFT JOIN coupons cp 
    //         ON o.coupon_id = cp.id
    //     WHERE o.id = ?
    //     GROUP BY o.id`,
    //     [orderId]
    // );

    // console.log(order);

    const [order] = await runQuery(`
        WITH 
        OrderItems AS (
            SELECT
                oi.order_id,
                SUM(oi.quantity) AS noOfItems,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', p.id,
                        'quantity', oi.quantity,
                        'purchase_price', oi.purchase_price,
                        'selling_price', oi.selling_price,
                        'discount_amount', oi.discount_amount,
                        'title', p.title,
                        'brand', p.brand,
                        'thumbnail', p.thumbnail,
                        'rating', p.rating,
                        'category', c.category
                    )
                ) AS items
            FROM order_item oi
            JOIN products p ON oi.product_id = p.id
            JOIN categories c ON c.id = p.category_id
            GROUP BY oi.order_id
        ),

        OrderStatus AS (
            SELECT
                os.order_id,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', os.id,
                        'status', os.status,
                        'notes', os.notes,
                        'created_at', os.created_at
                    )
                ) AS statuses
            FROM order_status_history os
            GROUP BY os.order_id
        )

        SELECT
            o.id AS order_id,
            o.subtotal,
            o.discount_amount,
            o.shipping,
            o.final_total,
            o.status,
            o.order_date,
            o.last_updated,
            oi.noOfItems,
            oi.items,
            CASE 
                WHEN o.coupon_id IS NOT NULL 
                    THEN 
                        JSON_OBJECT(
                            'id', cp.id,
                            'name', cp.name,
                            'code', cp.code,
                            'discount_type', cp.discount_type,
                            'discount_value', cp.discount_value,
                            'threshold_amount', cp.threshold_amount,
                            'applies_to', cp.applies_to
                        )
                ELSE NULL
            END AS coupon,
            os.statuses
        FROM orders o
        JOIN OrderItems oi 
            ON o.id = oi.order_id
        LEFT JOIN OrderStatus os
            ON o.id = os.order_id
        LEFT JOIN coupons cp 
            ON o.coupon_id = cp.id
        WHERE o.id = ?`, [orderId])

    return {...order, user}
}

exports.getOrdersByIdsHelper = async (orderIds) => {
    const orders = await runQuery(
        `SELECT
            o.id AS order_id,
            o.subtotal,
            o.discount_amount,
            o.shipping,
            o.final_total,
            o.status,
            o.order_date,
            o.last_updated,
            SUM(oi.quantity) AS noOfItems,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', p.id,
                    'quantity', oi.quantity,
                    'price', oi.purchase_price,
                    'title', p.title,
                    'brand', p.brand,
                    'thumbnail', p.thumbnail,
                    'rating', p.rating,
                    'category', c.category
                )
            ) AS items
        FROM orders o
        JOIN order_item oi ON o.id = oi.order_id
        JOIN products p   ON oi.product_id = p.id
        JOIN categories c ON c.id = p.category_id
        WHERE o.id IN (?)
        GROUP BY o.id
        ORDER BY FIELD(o.id, ?)`,
        [orderIds, orderIds]
    );

    return orders
}