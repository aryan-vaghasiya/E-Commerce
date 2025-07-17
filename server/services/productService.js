const runQuery = require("../db");

exports.getAllProducts = async(page, limit, offset) => {
    const status = "active"
    const results = await runQuery("SELECT p.*, i.stock FROM products p JOIN product_inventory i ON p.id = i.product_id WHERE p.status = ? LIMIT ? OFFSET ?", ["active", limit, offset]);
    if(results.length === 0){
        throw new Error ("Could not select all products")
    }

    const [{total}] = await runQuery("SELECT COUNT(*) as total FROM products")
    if(!total){
        throw new Error ("Could not count total products")
    }

    const productsRes = {
        products : results,
        currentPage : page,
        pages: Math.ceil (total / limit),
        total
    }
    return productsRes
}

exports.getSearchedProducts = async (page, limit, offset, query) => {
    const status = "active"
    const results = await runQuery(`SELECT p.*, i.stock FROM products p JOIN product_inventory i ON p.id = i.product_id WHERE p.title LIKE CONCAT('%', ?, '%') OR p.description LIKE CONCAT('%', ?, '%') AND p.status = ? LIMIT ? OFFSET ?`, [query, query,"active", limit, offset]);
    if(results.length === 0){
        // throw new Error ("Could not select searched products")
        return {}
    }

    const [{total}] = await runQuery("SELECT COUNT(*) as total FROM products WHERE title LIKE CONCAT('%', ?, '%') OR description LIKE CONCAT('%', ?, '%')", [query, query])
    if(!total){
        throw new Error ("Could not count total searched products")
    }

    const productsRes = {
        products : results,
        currentPage : page,
        pages: Math.ceil (total / limit),
        total
    }
    return productsRes
}


exports.getSingleProduct = async(productId) => {
    const results = await runQuery("SELECT p.*, i.stock FROM products p JOIN product_inventory i ON p.id = i.product_id WHERE p.id = ?", [productId]);
    if(results.length === 0){
        throw new Error ("Failed to fetch product details")
    }
    const product = results[0];

    const images = await runQuery("SELECT image FROM product_images WHERE product_id = ?", [productId])
    if(images.length === 0){
        throw new Error ("Failed to fetch images")
    }
    const imgArr = images.map((item) => item.image);
    product.images = imgArr;
    return product
}