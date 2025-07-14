const runQuery = require("../db")
const jwt = require("jsonwebtoken");
const secretKey = "abcde12345";
const bcrypt = require("bcrypt")

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
                                        p.rating,
                                        p.brand,
                                        p.thumbnail,
                                        DATE_FORMAT(p.created_on, '%d/%m/%Y') as created_on,
                                        DATE_FORMAT(p.last_updated, '%d/%m/%Y') as last_updated,
                                        pin.stock,
                                        DATE_FORMAT(pin.last_updated, '%d/%m/%Y') as last_updated
                                    FROM products p JOIN product_inventory pin ON p.id = pin.id
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
                                        p.rating,
                                        p.brand,
                                        p.thumbnail,
                                        DATE_FORMAT(p.created_on, '%d/%m/%Y') as created_on,
                                        DATE_FORMAT(p.last_updated, '%d/%m/%Y') as last_updated,
                                        pin.stock,
                                        DATE_FORMAT(pin.last_updated, '%d/%m/%Y') as last_updated
                                    FROM products p JOIN product_inventory pin ON p.id = pin.id
                                    WHERE p.id = ?`, [productId]);
    const image = await runQuery(`SELECT image FROM product_images WHERE product_id = ?`,[productId])
    const images = image.map(item => item.image)

    // console.log({...result, images});
    // console.log(images);

    return {...result, images}
}

exports.setProductData = async(id, title, brand, description, price, stock) => {
    // console.log({id, title, brand, description, price, stock});
    
    const updateProduct = await runQuery(`UPDATE products SET title = ?, brand = ?, description = ?, price = ? WHERE id = ?`, [title, brand, description, price, id])

    // if(updateProduct.affectedRows === 0){
    //     throw new Error("Could not Edit Product Details")
    // }

    const updateStock = await runQuery(`UPDATE product_inventory SET stock = ? WHERE product_id = ?`, [stock, id])

    // if(updateStock.affectedRows === 0){
    //     throw new Error("Could not Edit Product Stock")
    // }
}

exports.setProductImages = async(productId, imagePaths) => {
    for (let i = 0; i < imagePaths.length; i++) {
        const insertImage = await runQuery(
            `INSERT INTO product_images (product_id, image) VALUES (?, ?)`,
            [productId, imagePaths[i]]
        );
        // if(insertImage.affectedRows === 0){
        //     throw error;
        // }
    }
}

exports.removeImages = async(toDelete) => {
    for (let i = 0; i < toDelete.length; i++) {
        await runQuery(`DELETE FROM product_images WHERE image = ?`,[toDelete[i]]);
    }
}

exports.setThumbnail = async(productId, imagePath) => {
    await runQuery("UPDATE products SET thumbnail = ? WHERE id = ?", [imagePath, productId]);
}