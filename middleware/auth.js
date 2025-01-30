const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        const decodedToken = jwt.verify(token, 'subhra@123');

        const user = await User.findByPk(decodedToken.userId);
        if (!user) {
            throw new Error("User not found");
        }

        req.user = user;

        // req.user will carry:-
        // req.user = {
        //     id: 1,
        //     name: "John Doe",
        //     email: "john@example.com",
        //     password: "hashedpassword123", // Typically hashed
        //     createdAt: "2023-01-01T12:00:00.000Z",
        //     updatedAt: "2023-01-01T12:00:00.000Z",
        //     Sequelize instance methods and properties, e.g., .save(), .destroy()
        // };

        next();
    } catch (err) {
        console.error("Authentication failed:", err.message);
        res.status(401).json({ success: false, message: "Authentication failed" });
    }
};
