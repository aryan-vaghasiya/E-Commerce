const productService = require("../services/productService")

exports.allProducts = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    const offset = (page - 1) * limit
    const userId = req.user?.id || null

    try{
        const allProducts = await productService.getAllProducts(page, limit, offset, userId)
        res.status(200).json(allProducts);
    }
    catch (err){
        console.error("Error fetching all products: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.searchProduct = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    const offset = (page - 1) * limit
    const query = req.query.query;
    const userId = req.user?.id || null

    // const {page, limit, query} = req.query

    console.log(req.query);
    const queryParams = {...req.query, query, page, limit, offset}

    // console.log(page, limit, offset, query);

    try{
        const searchedProducts = await productService.getSearchedProducts(queryParams, userId);
        res.status(200).json(searchedProducts);
    }
    catch (err){
        console.error("Error fetching searched products: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.trendingProducts = async (req, res) => {
    const limit = parseInt(req.query.limit);
    const userId = req.user?.id || null

    try{
        const trendingProducts = await productService.getTrendingProducts(limit, userId);
        res.status(200).json(trendingProducts);
    }
    catch (err){
        console.error("Error fetching trending products: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.recentlyOrderedProducts = async (req, res) => {
    const limit = parseInt(req.query.limit);
    const userId = req.user?.id || null

    try{
        const trendingProducts = await productService.getRecentlyOrderedProducts(limit, userId);
        res.status(200).json(trendingProducts);
    }
    catch (err){
        console.error("Error fetching recently ordered products: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.singleProduct = async (req, res) => {
    const productId = req.params.id;
    const userId = req.user?.id || null

    try{
        const product = await productService.getSingleProduct(productId, userId)
        res.json(product);
    }
    catch (err){
        console.error("Error fetching product: ", err.message);
        res.status(500).json({ error: err.message });
    }
}