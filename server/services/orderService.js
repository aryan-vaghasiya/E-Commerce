const runQuery = require("../db")

exports.addOrder = async(userId, order, coupon) => {
    const checkCart = await runQuery("SELECT * FROM cart WHERE user_id = ? AND status = 'active'", [userId]);
    if (checkCart.length === 0) {
        throw new Error("No active cart found");
    }
    const cartId = checkCart[0].id; 

    const itemsToOrder = await runQuery(
        `SELECT ci.product_id, ci.quantity
        FROM cart_item ci
        WHERE ci.user_id = ? AND ci.cart_id = ?`, [userId, cartId]);

    for (const item of itemsToOrder) {
        const [checkStock] = await runQuery(`SELECT stock FROM product_inventory WHERE product_id =?`, [item.product_id]);
        // console.log(checkStock);

        if (!checkStock || checkStock.stock === undefined) {
            throw new Error(`Inventory not found for Product ID: ${item.product_id}`);
        }

        if(checkStock.stock < item.quantity){
            throw new Error(`Insufficient stock for Product ID: ${item.product_id}`)
        }
    }

    for (const item of itemsToOrder) {
        const updateStock = await runQuery(
            `UPDATE product_inventory SET stock = stock - ? WHERE product_id = ?`, [item.quantity, item.product_id]
        )
        
        if(updateStock.affectedRows === 0){
            throw new Error(`Could not Update Quantity for Product ID: ${item.product_id}`)
        }
    }




    // console.log(coupon);
    let orderItems = []
    if(coupon.code){
        const {newCart, couponData} = await this.checkCouponCode(userId, coupon.code)

        const insert = await runQuery("INSERT INTO orders (user_id, total) VALUES (?, 0)", [userId]);
        if (insert.affectedRows === 0) {
            throw new Error("Couldn't insert Order");
        }
        const orderId = insert.insertId;

        // console.log(newCart);
        orderItems = newCart.items.map(item => {
            if(item.coupon_discount && item.coupon_discount > 0){
                const item_price = item.price - (item.coupon_discount/item.quantity)
                return {product_id: item.id, quantity: item.quantity, purchase_price: parseFloat((item_price).toFixed(2))}
            }
            else{
                return {product_id: item.id, quantity: item.quantity, purchase_price: item.price}
            }
        })

        for(let i = 0; i < orderItems.length; i++){
            // console.log(orderItems[i].product_id, orderItems[i].quantity, orderItems[i].purchase_price);
            
            await runQuery(`INSERT INTO order_item (order_id, product_id, quantity, purchase_price) VALUES (?, ?, ?, ?)`, [orderId,orderItems[i].product_id, orderItems[i].quantity, orderItems[i].purchase_price])
        }
        // console.log(orderItems);

        const updateDiscount = await runQuery(`UPDATE orders SET 
                                                    total = ?,
                                                    coupon_id = ?, 
                                                    coupon_code = ?,
                                                    discount_amount = ?
                                                    WHERE id = ?`,
            [newCart.cartValue, couponData.id, couponData.code, newCart.discountValue, orderId]);
        if (updateDiscount.affectedRows === 0) {
            throw new Error("Couldn't update Total");
        }

        const couponUsage = await runQuery(`INSERT INTO coupon_usages (coupon_id, user_id, order_id) VALUES (?, ?, ?)`, [couponData.id, userId, orderId])

        const couponUsed = await runQuery(`UPDATE coupons SET times_used = times_used + ? WHERE id = ?`, [1, couponData.id])
    }

    else{

        const insert = await runQuery("INSERT INTO orders (user_id, total) VALUES (?, 0)", [userId]);
        if (insert.affectedRows === 0) {
            throw new Error("Couldn't insert Order");
        }
        const orderId = insert.insertId;

        const insertItem = await runQuery(`
            INSERT INTO order_item (order_id, product_id, quantity, purchase_price) 
            SELECT 
                ?, 
                ci.product_id, 
                ci.quantity, 
                CASE 
                    WHEN pd.offer_price IS NOT NULL 
                        THEN pd.offer_price
                    ELSE pp.price
                END AS purchase_price

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
                SET total = (
                    SELECT SUM(quantity * purchase_price)
                    FROM order_item
                    WHERE order_id = ?
                )
                WHERE id = ?`,
            [orderId, orderId]);
        if (setTotal.affectedRows === 0) {
            throw new Error("Couldn't update Total");
        }
    }



    const emptyCart = await runQuery(`DELETE FROM cart_item WHERE cart_id = ?`, [cartId])
    if (emptyCart.affectedRows === 0) {
        throw new Error("Couldn't empty Cart");
    }




    // const insertItem = await runQuery(`
    //     INSERT INTO order_item (order_id, product_id, quantity, purchase_price) 
    //     SELECT 
    //     ?, 
    //     ci.product_id, 
    //     ci.quantity, 
    //     pp.price

    //     FROM cart_item ci 
    //     JOIN product_pricing pp ON ci.product_id = pp.product_id
    //     WHERE ci.user_id = ? AND ci.cart_id = ? AND NOW() BETWEEN pp.start_time AND pp.end_time`,[orderId, userId, cartId]);

    // const insertItem = await runQuery(`
    //     INSERT INTO order_item (order_id, product_id, quantity, purchase_price) 
    //     SELECT ?, ci.product_id, ci.quantity, pp.price 
    //     FROM cart_item ci 
    //     JOIN products p ON ci.product_id = p.id
    //     JOIN product_pricing pp on pp.product_id = p.id
    //     WHERE ci.user_id = ? AND ci.cart_id = ? AND NOW() BETWEEN pp.start_time AND pp.end_time`,[orderId, userId, cartId]);
}

exports.getOrdersService = async (userId) => {
    const getOrders = await runQuery(`SELECT
                                        oi.order_id,
                                        oi.product_id AS id,
                                        oi.quantity, 
                                        oi.purchase_price AS price,
                                        p.title, 
                                        p.description, 
                                        p.rating, 
                                        p.brand, 
                                        p.thumbnail, 
                                        c.category,
                                        o.total,
                                        o.discount_amount,
                                        o.final_total,
                                        o.status
                                    FROM order_item oi 
                                    JOIN products p ON oi.product_id = p.id
                                    JOIN categories c ON c.id = p.category_id
                                    JOIN orders o ON oi.order_id = o.id
                                    WHERE o.user_id = ?`, [userId]);
    if(getOrders.length < 0){
        console.error("No Orders Exist");
        return{};
    }
    // console.log(getOrders);

    const grouped = {};
    getOrders.forEach(item => {
        if (!grouped[item.order_id]) {
            grouped[item.order_id] = {
                                        order_id: item.order_id,
                                        noOfItems: 0,
                                        products: [],
                                        final_total: item.final_total,
                                        cartValue: item.total,
                                        discount: item.discount_amount,
                                        status: item.status
                                    }
        }
        grouped[item.order_id].products.push({
            id: item.id,
            quantity: item.quantity,
            price: item.price,
            title: item.title,
            brand: item.brand,
            thumbnail: item.thumbnail,
            rating: item.rating,
            category: item.category
        });
        grouped[item.order_id].noOfItems += item.quantity;
    });

    const orders = Object.values(grouped);
    // console.log(orders);
    
    return orders;
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