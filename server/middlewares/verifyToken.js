const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {

    // console.log(req);
    // if (req.method === 'OPTIONS') {
    //     console.log('Skipping token verification for OPTIONS request');
    //     return res.sendStatus(204);
    // }

    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    // console.log(token);

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