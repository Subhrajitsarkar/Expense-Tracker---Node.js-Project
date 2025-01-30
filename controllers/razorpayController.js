const Razorpay = require('razorpay');
const Order = require('../models/orderModel');
const { generateAccessToken } = require('./loginController');

exports.createOrder = async (req, res) => {
    try {
        console.log('Creating Razorpay order'); // Log the start of the process

        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const amount = 10;
        const options = {
            amount: amount * 10, // Amount in paise
            currency: 'INR',
            receipt: `order_rcptid_${new Date().getTime()}`,
        };

        const order = await rzp.orders.create(options);
        console.log('Razorpay order created:', order); // Log the created order

        // Create an order record in the database
        await req.user.createOrder({ orderid: order.id, status: 'PENDING' });

        res.status(201).json({ order, key_id: rzp.key_id });
    } catch (err) {
        console.error('Error in creating Razorpay order:', err.message);
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
};

exports.updateTransactionStatus = async (req, res) => {
    try {
        const { payment_id, order_id } = req.body;

        // Find the order in the database
        const order = await Order.findOne({ where: { orderid: order_id } });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update the order and user records
        const promise1 = order.update({ paymentid: payment_id, status: 'SUCCESSFUL' });
        const promise2 = req.user.update({ ispremiumuser: true });

        await Promise.all([promise1, promise2]);

        res.status(202).json({ success: true, message: 'Transaction Successful', token: generateAccessToken(req.user.id, req.user.name, true) });
    } catch (err) {
        console.error('Error in updating transaction status:', err.message);
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
};