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
    const {id, title, brand, description, base_price, stock, base_discount, base_mrp, offer_price, offer_discount} = req.body;

    const localTime = new Date(new Date().toISOString().slice(0, 19)+"-05:30")
    const currentTime = localTime.toISOString().slice(0, 19).replace('T', ' ')
    const tenYearsLater = (parseInt(localTime.toISOString().slice(0,4)) + 10)+ localTime.toISOString().slice(4, 19).replace('T', ' ')
    const {start_time} = req.body ;
    const {end_time} = req.body;

    // console.log(start_time, end_time);

    // console.log(req.body);
    try{
        // await adminServices.setProductData(id, title, brand, description, price, stock, discount, mrp, start_time ?? currentTime, end_time ?? tenYearsLater);
        await adminServices.setProductData(id, title, brand, description, base_price, stock, base_discount, base_mrp, start_time, end_time, tenYearsLater, offer_price, offer_discount, currentTime);
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

exports.searchProduct = async (req, res) => {
    const query = req.query.query
    const price = req.query.price || 0
    if(!query.trim()) return res.json([])

    try{
        const products = await adminServices.getProductForCoupon(query, price)
        res.status(200).json(products);
    }
    catch(err){
        console.error("Error fetching Searched Products: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.addCoupon = async(req, res) => {
    const {coupon_name : name, coupon_code : code, discount_type, discount_value, discount_limit: threshold_amount, discount_on : applies_to, total_coupons, limit_per_user, start_time, end_time, selected_products, min_cart_value} = req.body

    const productIds = selected_products?.map(product => product.id)
    // console.log(discount_value);

    try{
        await adminServices.addCouponData(
                                            name, code, discount_value, discount_type, applies_to,
                                            // threshold_amount ?? null, 
                                            !threshold_amount ? null : threshold_amount, 
                                            !total_coupons ? null : total_coupons, 
                                            !limit_per_user ? null : limit_per_user,
                                            !min_cart_value ? null : min_cart_value,
                                            start_time, end_time, productIds
                                        );
        res.status(200).send("Coupon added Successfully");
    }
    catch(err){
        console.error("Error adding Coupon: ", err.message);
        res.status(500).json({ error: err.message });
    }

    // console.log(name, code, discount_value, discount_type, applies_to, threshold_amount ?? null, !total_coupons ? null : total_coupons, !limit_per_user ? null : limit_per_user, start_time, end_time, productIds);

}

exports.getCoupons = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    const offset = (page - 1) * limit
    const queryParams = {...req.query, page, limit, offset}

    try{
        const allCoupons = await adminServices.getAllCoupons(queryParams)
        res.status(200).json(allCoupons);
    }
    catch (err){
        console.error("Error fetching all coupons: ", err.message);
        res.status(500).json({ error: err.message });
    }
}