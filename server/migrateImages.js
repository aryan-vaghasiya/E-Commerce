const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const mysql = require("mysql2/promise");

const API_URL = "https://dummyjson.com/products?limit=100&skip=";

async function fetchAllProducts() {
  let products = [];
  for (let skip = 0; skip < 194; skip += 100) {
    const { data } = await axios.get(`${API_URL}${skip}`);
    products = products.concat(data.products);
  }
  return products;
}

async function downloadImage(url, filepath) {
  const writer = fs.createWriteStream(filepath);
  const resp = await axios.get(url, { responseType: "stream" });
  resp.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function main() {
  const products = await fetchAllProducts();

  // DB setup
  const db = await mysql.createPool({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "e_comm_db",
  });

  for (const p of products) {
    const pid = p.id;
    const productDir = path.join(__dirname, "../public/uploads/products", pid.toString());
    await fs.ensureDir(productDir);

    // Download thumbnail
    const thumbPath = path.join(productDir, "thumbnail.jpg");
    await downloadImage(p.thumbnail, thumbPath);

    // Download each product image
    for (let i = 0; i < p.images.length; i++) {
      const imgUrl = p.images[i];
      const imgPath = path.join(productDir, `image${i + 1}${path.extname(imgUrl)}`);
      await downloadImage(imgUrl, imgPath);
    }

    // Update database paths
    await db.execute(
      "UPDATE products SET thumbnail = ? WHERE id = ?",
      [`/uploads/products/${pid}/thumbnail.jpg`, pid]
    );

    // Clear old images
    await db.execute("DELETE FROM product_images WHERE product_id = ?", [pid]);

    // Insert new image paths
    for (let i = 0; i < p.images.length; i++) {
      const rel = `/uploads/products/${pid}/image${i + 1}${path.extname(p.images[i])}`;
      await db.execute(
        "INSERT INTO product_images (product_id, image) VALUES (?, ?)",
        [pid, rel]
      );
    }

    console.log(`✅ Product ${pid} images migrated.`);
  }

  console.log("🎉 All images migrated.");
  process.exit();
}

main().catch(console.error);
