const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

//The jwt.sign function creates a token that contains the userId and name of the user. These act as claims, or the data stored in the token. The token is signed using the JWT_SECRET key stored in the .env file. The token is then returned to the client.
function generateAccessToken(id, name, ispremiumuser) {
    return jwt.sign({ userId: id, name, ispremiumuser }, process.env.JWT_SECRET);
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User does not exist' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            res.status(200).json({
                success: true,
                message: 'User logged in successfully',
                token: generateAccessToken(user.id, user.name, user.ispremiumuser),
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Error in login:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};
