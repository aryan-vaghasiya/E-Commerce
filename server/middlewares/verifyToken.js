const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(402).json({ message: "Access Denied. No Token Provided." });
    }

    try{
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        // console.log(verified);
        next();
    }
    catch(err){
        return res.status(401).json({ message: "Invalid or expired token." });
    }
}