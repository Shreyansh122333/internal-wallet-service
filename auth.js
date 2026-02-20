const jwt = require('jsonwebtoken');
const SECRET_KEY = "your_super_secret_key"; // In production, use .env

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) return res.status(403).json({ error: "No token provided" });

    try {
        const decoded = jwt.verify(token.split(" ")[1], SECRET_KEY);
        req.user = decoded; // Adds userId and role to the request object
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid or expired token" });
    }
};

module.exports = { verifyToken, SECRET_KEY };