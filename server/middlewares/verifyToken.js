const jwt = require("jsonwebtoken");
const secretKey = "abcde12345";

module.exports = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(402).json({ message: "Access Denied. No Token Provided." });
    }

    try{
        const verified = jwt.verify(token, secretKey);
        req.user = verified;
        // console.log(verified);
        // console.log("User Verified");
        next();
    }
    catch(err){
        return res.status(401).json({ message: "Invalid or expired token." });
    }
}