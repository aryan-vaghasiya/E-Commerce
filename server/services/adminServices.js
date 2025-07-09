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

exports.setAcceptOrders = async(id) => {
    const setAccept = await runQuery(`UPDATE orders SET status = 'accepted' WHERE id IN ?`, [[id]])
    if(setAccept.affectedRows === 0){
        throw new Error("Could not Accept Orders")
    }
}