const adminServices = require("../services/adminServices")

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try{
        const token = await adminServices.loginAdmin(username, password);
        res.status(200).json({ message: "Admin Login Successful", token: token});
    }
    catch (err){
        console.error("Error Logging in: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.getDashboard = async (req, res) => {
    try{
        const data = await adminServices.getDashboard();
        res.status(200).json(data);
    }
    catch(err){
        console.error("Error fetching Dashboard: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.getOrders = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    const offset = (page - 1) * limit
    // console.log(page, limit, offset);

    try{
        const allOrders = await adminServices.getAllOrders(page, limit, offset)
        res.status(200).json(allOrders);
    }
    catch (err){
        console.error("Error fetching all orders: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.orderStatus = async (req, res) => {
    const {ids} = req.body
    const {status} = req.body
    // console.log(id);
    
    try{
        const data = await adminServices.setOrderStatus(ids, status);
        res.status(200).json(data);
    }
    catch(err){
        console.error("Error accepting Orders: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.getSingleOrder = async (req,res) => {
    const orderId = req.query.orderId
    // console.log(orderId);
    try{
        const orderData = await adminServices.getOrderData(orderId);
        res.status(200).json(orderData);
    }
    catch(err){
        console.error(`Error fetching Order ${orderId} : ${ err.message}`);
        res.status(500).json({ error: err.message });
    }
}

exports.getProducts = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    const offset = (page - 1) * limit
    // console.log(page, limit, offset);

    try{
        const allProducts = await adminServices.getAllProducts(page, limit, offset)
        res.status(200).json(allProducts);
    }
    catch (err){
        console.error("Error fetching all products: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.getSingleProduct = async (req,res) => {
    const productId = req.query.productId
    // console.log(productId);
    try{
        const productData = await adminServices.getProductData(productId);
        res.status(200).json(productData);
    }
    catch(err){
        console.error(`Error fetching Product ${productId} : ${ err.message}`);
        res.status(500).json({ error: err.message });
    }
}

exports.setEditedProduct = async (req, res) => {
    const {id, title, brand, description, price, stock} = req.body;

    // console.log(req.body);
    try{
        await adminServices.setProductData(id, title, brand, description, price, stock);
        return res.status(200).send("Product Edited Successfully");
    }
    catch(err){
        console.error("Error Editing Product Details: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.uploadProductImages = async (req, res) => {
    const productId = req.params.id
    const files = req.files
    const imagePaths = files.map(file => `/uploads/products/${productId}/${file.filename}`);

    // console.log(productId, files);
    try{
        await adminServices.setProductImages(productId, imagePaths);
        res.status(200).send("Images Added Successfully");
    }
    catch(err){
        console.error("Error Adding Product Images: ", err.message);
        res.status(500).json({ error: err.message });
    }
}