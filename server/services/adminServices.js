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
        throw new Error ("Could not select all products")
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
                                    p.price,
                                    p.rating,
                                    p.brand,
                                    p.thumbnail
                                    FROM order_item oi JOIN products p ON oi.product_id = p.id
                                    WHERE oi.order_id = ?`,[orderId]);
    result.products = products
    // console.log(result);
    return result;
}

exports.getAllProducts = async(page, limit, offset) => {
    const results = await runQuery(`SELECT
                                        p.id,
                                        p.title,
                                        p.price,
                                        p.mrp,
                                        p.discount,
                                        p.rating,
                                        p.brand,
                                        p.thumbnail,
                                        p.status,
                                        DATE_FORMAT(p.created_on, '%d/%m/%Y') as created_on,
                                        DATE_FORMAT(p.last_updated, '%d/%m/%Y') as last_updated,
                                        pin.stock,
                                        DATE_FORMAT(pin.last_updated, '%d/%m/%Y') as inventory_updated
                                    FROM products p JOIN product_inventory pin ON p.id = pin.product_id
                                    ORDER BY p.last_updated DESC
                                    LIMIT ?
                                    OFFSET ?`, [limit, offset]);
    if(results.length === 0){
        throw new Error ("Could not select all products")
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
                                        p.price,
                                        p.mrp,
                                        p.discount,
                                        p.rating,
                                        p.brand,
                                        p.thumbnail,
                                        p.status,
                                        DATE_FORMAT(p.created_on, '%d/%m/%Y') as created_on,
                                        DATE_FORMAT(p.last_updated, '%d/%m/%Y') as last_updated,
                                        pin.stock,
                                        DATE_FORMAT(pin.last_updated, '%d/%m/%Y') as last_updated
                                    FROM products p JOIN product_inventory pin ON p.id = pin.product_id
                                    WHERE p.id = ?`, [productId]);
    const image = await runQuery(`SELECT id, image FROM product_images WHERE product_id = ?`,[productId])
    // const images = image.map(item => item.image)
    // console.log(images);

    // console.log({...result, images});
    // console.log(images);

    // console.log({...result, image})
    return {...result, image}
}

exports.setProductData = async(id, title, brand, description, price, stock, discount, mrp) => {
    // console.log({id, title, brand, description, price, stock});
    
    const updateProduct = await runQuery(`UPDATE products SET title = ?, brand = ?, description = ?, price = ?, discount = ?, mrp = ? WHERE id = ?`, [title, brand, description, price, discount, mrp, id])

    if(updateProduct.affectedRows === 0){
        throw new Error("Could not Edit Product Details")
    }

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
    const result = await runQuery(`INSERT INTO products (title, brand, description, price, status, rating, mrp, discount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,[title, brand, description, price, status, 0.00, mrp, discount])

    if(result.length < 0){
        throw new Error ("Could not add Product Details")
    }

    const productId = result.insertId
    // console.log(productId);

    const addStock = await runQuery(`INSERT INTO product_inventory (product_id, stock) VALUES (?, ?)`,[productId, stock])

    return productId
}

exports.updateProductStatus = async (newStatus, productId) => {
    await runQuery(`UPDATE products SET status = ? WHERE id = ?`, [newStatus, productId])
}

exports.deleteProductPermanently = async(productId) => {
    const productInventory =  await runQuery(`DELETE FROM product_inventory WHERE product_id = ?`,[productId])
    if(productInventory.affectedRows === 0){
        throw new Error ("Product Inventory Not Found")
    }
    const productImages = await runQuery(`DELETE FROM product_images WHERE product_id = ?`,[productId])
    if(productImages.affectedRows === 0){
        throw new Error ("Product Images Not Found")
    }
    const removeCartItem = await runQuery(`DELETE FROM cart_item WHERE product_id = ?`, [productId])
    if(removeCartItem.affectedRows === 0){
        throw new Error ("Couldn't remove Product from Cart")
    }
    const removeOrderItem =  await runQuery(`DELETE FROM order_item WHERE product_id = ?`,[productId])
    if(removeOrderItem.affectedRows === 0){
        throw new Error ("Couldn't remove Product from Orders")
    }
    const productDetails = await runQuery(`DELETE FROM products WHERE id = ?`,[productId])
    if(productDetails.affectedRows === 0){
        throw new Error ("Product Details Not Found")
    }

    const absolutePath = path.join(__dirname, "../uploads/products", `${productId}`)
    // console.log(absolutePath);
    fs.remove(absolutePath)
}