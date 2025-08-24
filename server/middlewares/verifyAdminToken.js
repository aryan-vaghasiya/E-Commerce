const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        // return res.status(402).json({ message: "Access Denied. No Token Provided." });
        throw new Error ("Access Denied. No Token Provided.")
    }

    try{
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        if(verified.role !== "admin"){
            return res.status(403).json({ message: "Access Denied. Admins only." });
        }

        req.user = verified;
        // console.log(verified);
        // console.log("User Verified");
        next();
    }
    catch(err){
        return res.status(401).json({ message: "Invalid or expired token." });
    }
}