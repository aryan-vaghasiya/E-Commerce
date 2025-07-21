const runQuery = require("../db");

exports.getAllProducts = async(page, limit, offset) => {
    const status = "active"
    const results = await runQuery(`SELECT p.*, pp.price, pp.mrp, pp.discount, i.stock 
        FROM products p 
        JOIN product_inventory i ON p.id = i.product_id
        JOIN product_pricing pp ON pp.product_id = p.id
        WHERE p.status = ?
        AND NOW() BETWEEN pp.start_time AND pp.end_time
        LIMIT ? OFFSET ?`, ["active", limit, offset]);
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
    const results = await runQuery(`SELECT p.*, pp.price, pp.mrp, pp.discount, i.stock FROM products p JOIN product_inventory i ON p.id = i.product_id JOIN product_pricing pp ON pp.product_id = p.id WHERE p.title LIKE CONCAT('%', ?, '%') OR p.description LIKE CONCAT('%', ?, '%') AND p.status = ? AND NOW() BETWEEN pp.start_time AND pp.end_time LIMIT ? OFFSET ?`, [query, query,"active", limit, offset]);
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
    const results = await runQuery("SELECT p.*, pp.price, pp.mrp, pp.discount, i.stock FROM products p JOIN product_inventory i ON p.id = i.product_id JOIN product_pricing pp ON pp.product_id = p.id WHERE p.id = ? AND NOW() BETWEEN pp.start_time AND pp.end_time", [productId]);
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