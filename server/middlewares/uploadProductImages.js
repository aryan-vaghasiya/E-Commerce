const multer = require("multer");
const fs = require("fs-extra");
const path = require("path")

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const productId = req.params.id;
        const dir = path.join(__dirname, '../uploads/products', productId);
        await fs.ensureDir(dir);
        // console.log("mid",productId, dir);
        
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 100)}`;
        cb(null, `${uniqueName}${ext}`);
    }
});

const upload = multer({ storage });
module.exports = upload