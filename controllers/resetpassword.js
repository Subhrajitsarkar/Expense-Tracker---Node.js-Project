const uuid = require('uuid');
const sgMail = require('@sendgrid/mail');
const bcrypt = require('bcrypt');

const User = require('../models/userModel');
const Forgotpassword = require('../models/forgotpassword');

const forgotpassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (user) {
            const id = uuid.v4();
            await user.createForgotpassword({ id, active: true });

            sgMail.setApiKey(process.env.API_KEY);

            const msg = {
                to: email, // Change to your recipient
                from: 'subhrajit28sarkar@gmail.com', // Change to your verified sender
                subject: 'Sending with SendGrid is Fun',
                text: 'Hello👋👋👋 my name is subhrajit,,,,,,hahaha',
                html: `<a href="http://localhost:3000/password/resetpassword/${id}">Reset password</a>`,
            };

            try {
                const response = await sgMail.send(msg);
                return res.status(response[0].statusCode).json({ message: 'Link to reset password sent to your mail', success: true });
            } catch (error) {
                throw new Error(error);
            }

        } else {
            throw new Error('User doesn\'t exist');
        }
    } catch (err) {
        console.error(err);
        return res.json({ message: err.message, success: false });
    }
};

const resetpassword = async (req, res) => {
    const id = req.params.id;
    try {
        const forgotpasswordrequest = await Forgotpassword.findOne({ where: { id } });

        if (forgotpasswordrequest) {
            await forgotpasswordrequest.update({ active: false });

            res.status(200).send(`
                <html>
                    <script>
                        function formsubmitted(e) {
                            e.preventDefault();
                            console.log('called');
                        }
                    </script>

                    <form action="/password/updatepassword/${id}" method="get">
                        <label for="newpassword">Enter New password</label>
                        <input name="newpassword" type="password" required></input>
                        <button>reset password</button>
                    </form>
                </html>
            `);
            res.end();
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
};

const updatepassword = async (req, res) => {
    try {
        const { newpassword } = req.query;
        const { resetpasswordid } = req.params;

        const resetpasswordrequest = await Forgotpassword.findOne({ where: { id: resetpasswordid } });

        if (resetpasswordrequest) {
            const user = await User.findOne({ where: { id: resetpasswordrequest.userId } });

            if (user) {
                const saltRounds = 10;
                const salt = await bcrypt.genSalt(saltRounds);
                const hash = await bcrypt.hash(newpassword, salt);

                await user.update({ password: hash });
                return res.status(201).json({ message: 'Successfully updated the new password' });
            } else {
                return res.status(404).json({ error: 'No user exists', success: false });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(403).json({ error: error.message, success: false });
    }
};

module.exports = {
    forgotpassword,
    updatepassword,
    resetpassword,
};
