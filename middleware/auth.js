const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decodedToken.userId);
        if (!user) {
            throw new Error("User not found");
        }

        req.user = user;

        next();
    } catch (err) {
        console.error("Authentication failed:", err.message);
        res.status(401).json({ success: false, message: "Authentication failed" });
    }
};