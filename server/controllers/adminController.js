const runQuery = require("../db");
const adminServices = require("../services/adminServices")
const dayjs = require('dayjs')

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

exports.orderCancelRefund = async (req, res) => {
    const {orderId, userId, reason} = req.body

    try{
        const data = await adminServices.orderRefund(orderId, userId, reason);
        res.status(200).json(data);
    }
    catch(err){
        console.error("Error accepting Orders: ", err.message);
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

exports.getProductOffers = async (req, res) => {
    const productId = req.query.productId
    // console.log(productId);

    try{
        const offersData = await adminServices.getOffersData(productId);
        res.status(200).json(offersData);
    }
    catch(err){
        console.error(`Error fetching Offers for Product ${productId} : ${ err.message}`);
        res.status(500).json({ error: err.message });
    }
}

exports.setProductOffer = async (req, res) => {
    // console.log(req.body);
    const {product_id, offer_price, offer_discount, start_time, end_time} = req.body;

    try{
        const newOffers = await adminServices.setOfferData(product_id, offer_price, offer_discount, start_time, end_time);
        // return res.send("Product Offer Added Successfully");
        return res.status(200).json(newOffers);
    }
    catch(err){
        console.error("Error Adding Product Offer: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.extendProductOffer = async (req, res) => {
    const {offer_id, start_time, end_time} = req.body
    
    try{
        await adminServices.editOfferData(offer_id, start_time, end_time);
        return res.status(200).send("Product Offer Extended Successfully");
    }
    catch(err){
        console.error("Error Extending Product Offer: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.endProductOffer = async (req, res) => {
    const {offer_id} = req.body
    
    try{
        await adminServices.endOfferDate(offer_id);
        return res.status(200).send("Product Offer Ended Successfully");
    }
    catch(err){
        console.error("Error Ending Product Offer: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.deleteProductOffer = async (req, res) => {
    const {offer_id} = req.body
    
    try{
        await adminServices.deleteOfferData(offer_id);
        return res.status(200).send("Product Offer Ended Successfully");
    }
    catch(err){
        console.error("Error Ending Product Offer: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.setEditedProduct = async (req, res) => {
    const {id, title, brand, description, category, base_price, stock, base_discount, base_mrp} = req.body;

    // console.log(category);
    const localTime = new Date(new Date().toISOString().slice(0, 19)+"-05:30")
    const currentTime = localTime.toISOString().slice(0, 19).replace('T', ' ')
    const tenYearsLater = (parseInt(localTime.toISOString().slice(0,4)) + 10)+ localTime.toISOString().slice(4, 19).replace('T', ' ')

    try{
        // await adminServices.setProductData(id, title, brand, description, price, stock, discount, mrp, start_time ?? currentTime, end_time ?? tenYearsLater);
        await adminServices.setProductData(id, title, brand, description, category, base_price, stock, base_discount, base_mrp, tenYearsLater, currentTime);
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
    const {title, brand, description, price, status, stock, mrp, discount, selected_category} = req.body

    // console.log(selected_category);
    try{
        const productId = await adminServices.addDetails(title, brand, description, price, status, stock, mrp, discount, selected_category);
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
    const {
        coupon_name : name, 
        coupon_code : code, 
        discount_type, 
        discount_value, 
        discount_limit: threshold_amount, 
        discount_on : applies_to, 
        total_coupons, 
        limit_per_user, 
        start_time, 
        end_time, 
        selected_products, 
        min_cart_value, 
        for_new_users_only,
        category
    } = req.body

    const productIds = selected_products?.map(product => product.id)
    const categoryIds = category?.map(item => item.id)

    try{
        await adminServices.addCouponData(
                                            name, 
                                            code.toLowerCase(), 
                                            discount_value, 
                                            discount_type, 
                                            applies_to,
                                            // threshold_amount ?? null, 
                                            !threshold_amount ? null : threshold_amount, 
                                            !total_coupons ? null : total_coupons, 
                                            !min_cart_value ? null : min_cart_value,
                                            !for_new_users_only ? 0 : 1,
                                            // !limit_per_user ? null : for_new_users_only ? 1 : limit_per_user,
                                            for_new_users_only ? 1 : (!limit_per_user ? null : limit_per_user),
                                            start_time, 
                                            end_time, 
                                            productIds,
                                            categoryIds
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

exports.getSingleCouponDetails = async (req, res) => {
    const couponId = req.params.couponId

    try{
        const coupon = await adminServices.getSingleCoupon(couponId)
        res.status(200).json(coupon);
    }
    catch(err){
        console.error("Error fetching single coupon: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.getCouponCategories = async (req, res) => {
    const couponId = req.query.couponId

    try{
        const couponCategories = await adminServices.getCouponCategories(couponId)
        res.status(200).json(couponCategories);
    }
    catch(err){
        console.error("Error fetching coupon categories: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.getSingleCouponUsages = async (req, res) => {
    const couponId = req.params.couponId
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    const offset = (page - 1) * limit

    try{
        const usages = await adminServices.getCouponUsages(couponId, limit, offset)
        res.status(200).json(usages);
    }
    catch (err){
        console.error("Error fetching coupon usages: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.getSingleCouponProducts = async (req, res) => {
    const couponId = req.params.couponId
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    const offset = (page - 1) * limit

    try{
        const usages = await adminServices.getCouponProducts(couponId, limit, offset)
        res.status(200).json(usages);
    }
    catch (err){
        console.error("Error fetching coupon products: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.editCoupon = async (req, res) => {
    // console.log(req.body);
    const {end_time, total_coupons, limit_per_user, id} = req.body;

    try{
        await adminServices.updateCouponData(end_time, !!total_coupons ? total_coupons : null, !!limit_per_user ? limit_per_user : null, id)
        res.status(200).send("Coupon edited Successfully");
    }
    catch(err){
        console.error("Error editing Coupon: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.deactivateCoupon = async (req, res) => {
    const {couponId} = req.body;
    // console.log(couponId);

    try{
        await adminServices.endCoupon(couponId)
        res.status(200).send("Coupon deactivated Successfully");
    }
    catch(err){
        console.error("Error deactivating Coupon: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.getAllCategories = async (req, res) => {
    try{
        const allCategories = await adminServices.getCategories()
        res.status(200).json(allCategories);
    }
    catch(err){
        console.error("Error fetching all Categories: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.getSingleCouponReportSummary = async (req, res) => {
    const couponId = req.params.couponId
    // const days = req.query.days
    const fromTime = req.query.from
    const toTime = req.query.to
    // console.log(days);

    // let fromDate;
    // let toDate;

    // if(days){
    //     const todayStart = dayjs().startOf("day")
    //     fromDate = dayjs(todayStart).subtract(days, "day").format("YYYY-MM-DD HH:mm:ss")
    //     toDate = dayjs().format("YYYY-MM-DD HH:mm:ss")
    // }
    // console.log(fromDate);
    // console.log(typeof fromDate);

    try{
        const report = await adminServices.getCouponReport(couponId, fromTime, toTime)
        // console.log(report);
        res.status(200).json(report)
        // res.status(200).json({...report, days})
    }
    catch (err){
        console.error("Error fetching coupon report summary: ", err.message)
        res.status(500).json({ error: err.message })
    }
}

exports.getSingleCouponReportProducts = async (req, res) => {
    const couponId = req.params.couponId
    const fromTime = req.query.from
    const toTime = req.query.to
    const limit = req.query.limit
    const sortBy = req.query.sortBy
    const orderBy = req.query.orderBy

    try{
        const report = await adminServices.getCouponReportProducts(couponId, fromTime, toTime, limit, sortBy, orderBy)
        res.status(200).json(report)
    }
    catch (err){
        console.error("Error fetching coupon report products: ", err.message)
        res.status(500).json({ error: err.message })
    }
}

exports.getSingleCouponReportCategories= async (req, res) => {
    const couponId = req.params.couponId
    const fromTime = req.query.from
    const toTime = req.query.to
    const limit = req.query.limit
    const sortBy = req.query.sortBy
    const orderBy = req.query.orderBy

    try{
        const report = await adminServices.getCouponReportCategories(couponId, fromTime, toTime, limit, sortBy, orderBy)
        res.status(200).json(report)
    }
    catch (err){
        console.error("Error fetching coupon report categories: ", err.message)
        res.status(500).json({ error: err.message })
    }
}

exports.getSingleCouponReportUsers = async (req, res) => {
    const couponId = req.params.couponId
    const fromTime = req.query.from
    const toTime = req.query.to
    const limit = req.query.limit
    const sortBy = req.query.sortBy
    const orderBy = req.query.orderBy

    try{
        const report = await adminServices.getCouponReportUsers(couponId, fromTime, toTime, limit, sortBy, orderBy)
        res.status(200).json(report)
    }
    catch (err){
        console.error("Error fetching coupon report users: ", err.message)
        res.status(500).json({ error: err.message })
    }
}

exports.getSingleCouponReportDates = async (req, res) => {
    const couponId = req.params.couponId
    const fromTime = req.query.from
    const toTime = req.query.to
    const limit = req.query.limit
    const sortBy = req.query.sortBy
    const orderBy = req.query.orderBy

    try{
        const report = await adminServices.getCouponReportDates(couponId, fromTime, toTime, limit, sortBy, orderBy)
        res.status(200).json(report)
    }
    catch (err){
        console.error("Error fetching coupon report dates: ", err.message)
        res.status(500).json({ error: err.message })
    }
}