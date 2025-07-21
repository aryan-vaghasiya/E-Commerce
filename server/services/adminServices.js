const runQuery = require("../db")
const jwt = require("jsonwebtoken");
const secretKey = "abcde12345";
const bcrypt = require("bcrypt")
const fs = require("fs-extra");
const path = require("path")

exports.loginAdmin = async(username, password) => {
    if(username !== "admin"){
        throw new Error ("You do not have Admin Privilages")
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
            secretKey,
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
    const [sales] = await runQuery("SELECT SUM(total) as sales FROM orders")
    const [customers] = await runQuery("SELECT COUNT(*) as customers FROM users")
    const recentOrders = await runQuery(`SELECT 
                                            o.id,
                                            u.first_name,
                                            u.last_name,
                                            o.status,
                                            DATE_FORMAT(o.order_date, '%d/%m/%Y') as order_date,
                                            o.total
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
                                        o.total
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

exports.setOrderStatus = async(id, status) => {
    // console.log(id, status);
    
    const setAccept = await runQuery(`UPDATE orders SET status = ? WHERE id IN ?`, [status, [id]])
    if(setAccept.affectedRows === 0){
        throw new Error("Could not Update Order Status")
    }
}

exports.getOrderData = async (orderId) => {
    const [result] = await runQuery(`SELECT
                                    o.id, 
                                    o.status,
                                    DATE_FORMAT(o.order_date, '%d/%m/%Y') as order_date,
                                    DATE_FORMAT(o.order_date, '%H:%i:%s') as order_time,
                                    o.total,

                                    u.first_name,
                                    u.last_name,
                                    u.addLine1,
                                    u.addLine2,
                                    u.state,
                                    u.city,
                                    u.pincode,
                                    u.number,
                                    u.email
                                FROM orders o JOIN users u ON o.user_id = u.id
                                WHERE o.id = ?`, [orderId]);
    const products = await runQuery(`SELECT
                                    oi.product_id,
                                    oi.quantity,
                                    oi.purchase_price as price,
                                    p.title,
                                    pp.price,
                                    pp.mrp,
                                    pp.discount,
                                    p.rating,
                                    p.brand,
                                    p.thumbnail
                                    FROM order_item oi 
                                    JOIN products p ON oi.product_id = p.id
                                    JOIN product_pricing pp on pp.product_id = p.id
                                    WHERE oi.order_id = ? 
                                    AND NOW() BETWEEN pp.start_time AND pp.end_time`,[orderId]);
    result.products = products
    // console.log(result);
    return result;
}

exports.getAllProducts = async(page, limit, offset) => {
    const results = await runQuery(`SELECT
                                        p.id,
                                        p.title,
                                        pp.price,
                                        pp.mrp,
                                        pp.discount,
                                        p.rating,
                                        p.brand,
                                        p.thumbnail,
                                        p.status,
                                        DATE_FORMAT(p.created_on, '%d/%m/%Y') as created_on,
                                        DATE_FORMAT(p.last_updated, '%d/%m/%Y') as last_updated,
                                        pin.stock,
                                        DATE_FORMAT(pin.last_updated, '%d/%m/%Y') as inventory_updated
                                    FROM products p
                                    JOIN product_inventory pin ON p.id = pin.product_id
                                    JOIN product_pricing pp on pp.product_id = p.id
                                    WHERE NOW() BETWEEN pp.start_time AND pp.end_time
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
                                        DATE_FORMAT(p.created_on, '%d/%m/%Y') as created_on,
                                        DATE_FORMAT(p.last_updated, '%d/%m/%Y') as last_updated,
                                        pin.stock,
                                        DATE_FORMAT(pin.last_updated, '%d/%m/%Y') as last_updated
                                    FROM products p 
                                    JOIN product_inventory pin ON p.id = pin.product_id
                                    JOIN product_pricing pp on pp.product_id = p.id
                                    WHERE p.id = ? AND NOW() BETWEEN pp.start_time AND pp.end_time`, [productId]);
    const image = await runQuery(`SELECT id, image FROM product_images WHERE product_id = ?`,[productId])
    // const images = image.map(item => item.image)
    // console.log(images);

    // console.log({...result, images});
    // console.log(images);

    // console.log({...result, image})
    return {...result, image}
}

exports.setProductData = async(id, title, brand, description, price, stock, discount, mrp, start_time, end_time , tenYearsLater) => {
    // console.log({id, title, brand, description, price, stock});
    // console.log({start_time, end_time, tenYearsLater});
    
    const updateProduct = await runQuery(`UPDATE products SET title = ?, brand = ?, description = ? WHERE id = ?`, [title, brand, description, id])
    if(updateProduct.affectedRows === 0){
        throw new Error("Could not Edit Product Details")
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

    // 1. Find currently active pricing for the product
    const [activePricing] = await runQuery(`
    SELECT * FROM product_pricing 
        WHERE product_id = ? AND NOW() BETWEEN start_time AND end_time
        ORDER BY id DESC LIMIT 1
    `, [id]);

    if (!activePricing) {
        throw new Error("No active pricing entry found for this product");
    }

    const activeId = activePricing.id;
    const prevPrice = activePricing.price;
    const prevMrp = activePricing.mrp;
    const prevDiscount = activePricing.discount;

    // 2. Set end_time of current pricing to new offer's start time
    const update = await runQuery(
        `UPDATE product_pricing SET end_time = ? WHERE id = ?`,
        [start_time, activeId]
    );

    if (update.affectedRows === 0) {
        throw new Error("Failed to update previous pricing");
    }

    // 3. Add the new pricing offer (start_time + 1s to avoid exact overlap)
    const [{ new_sTime }] = await runQuery(
        `SELECT DATE_ADD(?, INTERVAL 1 SECOND) AS new_sTime`,
        [start_time]
    );

    // You can also use: new Date(new Date(start_time).getTime() + 1000) in JS directly
    const insertNew = await runQuery(
        `INSERT INTO product_pricing (product_id, start_time, end_time, price, mrp, discount) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, new_sTime, end_time, price, mrp, discount]
    );

    if (insertNew.affectedRows === 0) {
        throw new Error("Failed to insert new pricing");
    }

    // 4. Only re-add the "previous" pricing after offer ends if this is a temporary discount
    // (optional, based on business rule)
    const reAddTime = await runQuery(
        `SELECT DATE_ADD(?, INTERVAL 1 SECOND) AS new_eTime`,
        [end_time]
    );
    const new_eTime = reAddTime[0].new_eTime;

    // const defaultEnd = '2035-07-17 12:30:00'; // or calculate tenYearsLater in JS

    const reinstate = await runQuery(
        `INSERT INTO product_pricing (product_id, start_time, end_time, price, mrp, discount) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, new_eTime, tenYearsLater, prevPrice, prevMrp, prevDiscount]
    );


    const updateStock = await runQuery(`UPDATE product_inventory SET stock = ? WHERE product_id = ?`, [stock, id])
    if(updateStock.affectedRows === 0){
        throw new Error("Could not Edit Product Stock")
    }
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

exports.addDetails = async (title, brand, description, price, status, stock, mrp, discount) => {
    const result = await runQuery(`
        INSERT INTO products (title, brand, description, status, rating) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,[title, brand, description, status, 0.00]
    )
    if(result.affectedRows === 0){
        throw new Error ("Could not add Product Details")
    }

    const productId = result.insertId
    // console.log(productId);

    const addPricing = runQuery(`INSERT INTO product_pricing (product_id, start_time, end_time, price, mrp, discount) VALUES (?, ?, ?, ?, ?, ?)`, [productId, start_time, end_time, price, mrp, discount])
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