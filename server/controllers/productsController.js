const productService = require("../services/productService")

exports.allProducts = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    const offset = (page - 1) * limit

    try{
        const allProducts = await productService.getAllProducts(page, limit, offset)
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

    // console.log(page, limit, offset, query);

    try{
        const searchedProducts = await productService.getSearchedProducts(page, limit, offset, query);
        res.status(200).json(searchedProducts);
    }
    catch (err){
        console.error("Error fetching searched products: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.trendingProducts = async (req, res) => {
    const limit = parseInt(req.query.limit);

    try{
        const trendingProducts = await productService.getTrendingProducts(limit);
        res.status(200).json(trendingProducts);
    }
    catch (err){
        console.error("Error fetching trending products: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.recentlyOrderedProducts = async (req, res) => {
    const limit = parseInt(req.query.limit);

    try{
        const trendingProducts = await productService.getRecentlyOrderedProducts(limit);
        res.status(200).json(trendingProducts);
    }
    catch (err){
        console.error("Error fetching recently ordered products: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.singleProduct = async (req, res) => {
    const productId = req.params.id;

    try{
        const product = await productService.getSingleProduct(productId)
        res.json(product);
    }
    catch (err){
        console.error("Error fetching product: ", err.message);
        res.status(500).json({ error: err.message });
    }
}