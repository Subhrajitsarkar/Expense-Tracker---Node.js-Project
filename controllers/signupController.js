const bcrypt = require('bcrypt');
const User = require('../models/userModel');

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        const data = await User.create({ name, email, password: hashedPassword });

        res.status(201).json({ success: true, data });
    } catch (err) {
        console.error('Error in signup:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
};
