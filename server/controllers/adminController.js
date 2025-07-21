const runQuery = require("../db");
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
        // console.log(allProducts);
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
    const {id, title, brand, description, price, stock, discount, mrp} = req.body;

    const localTime = new Date(new Date().toISOString().slice(0, 19)+"-05:30")
    const currentTime = localTime.toISOString().slice(0, 19).replace('T', ' ')
    const tenYearsLater = (parseInt(localTime.toISOString().slice(0,4)) + 10)+ localTime.toISOString().slice(4, 19).replace('T', ' ')
    const {start_time} = req.body ;
    const {end_time} = req.body;

    // console.log(start_time, end_time);

    // console.log(req.body);
    try{
        // await adminServices.setProductData(id, title, brand, description, price, stock, discount, mrp, start_time ?? currentTime, end_time ?? tenYearsLater);
        await adminServices.setProductData(id, title, brand, description, price, stock, discount, mrp, start_time, end_time, tenYearsLater);
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
        const newImages = await adminServices.setProductImages(productId, imagePaths);
        res.status(200).json(newImages);
    }
    catch(err){
        console.error("Error Adding Product Images: ", err.message);
        res.status(500).json({ error: err.message });
    }
}
exports.uploadProductThumbnail = async (req, res) => {
    const productId = req.params.id
    const file = req.file
    // console.log(productId, file);

    const imagePath = `/uploads/products/${productId}/${file.filename}`


    // const thumbnail = imagePath;
    // await runQuery("UPDATE products SET thumbnail = ? WHERE id = ?", [thumbnail, productId]);
    try{
        await adminServices.setThumbnail(productId, imagePath);
        res.status(200).send("Thumbnail Added Successfully");
    }
    catch(err){
        console.error("Error Adding Thumbnail : ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.removeProductImages = async (req, res) => {
    const toDeleteIds = req.body;
    // console.log(toDeleteIds);

    try{
        await adminServices.removeImages(toDeleteIds);
        res.status(200).send("Images Deleted Successfully");
    }
    catch(err){
        console.error("Error Deleting Product Images: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.addProductDetails = async(req, res) => {
    const {title, brand, description, price, status, stock, mrp, discount} = req.body

    try{
        const productId = await adminServices.addDetails(title, brand, description, price, status, stock, mrp, discount);
        return res.status(200).json(productId)
    }
    catch(err){
        console.error("Error Adding Product Details: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.deleteProduct = async (req, res) => {
    const {productId} = req.body
    // console.log(productId);
    
    try{
        await adminServices.deleteProductPermanently(productId);
        return res.status(200).send("Permanently Deleted Product")
    }
    catch(err){
        console.error("Error Deleting Product Permanently", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.updateProductStatus = async (req, res) => {
    const {newStatus, productId} = req.body;

    try{
        await adminServices.updateProductStatus(newStatus, productId)
        res.status(200).send("Product status updated Successfully");
    }
    catch(err){
        console.error("Error updating product status", err.message);
        res.status(500).json({ error: err.message });
    }
}