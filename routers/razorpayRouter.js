const express = require('express');
const razorpayController = require('../controllers/razorpayController');
const userAuthentication = require('../middleware/auth');

const router = express.Router();

// Razorpay routes
router.get('/premiummembership', userAuthentication.authenticate, razorpayController.createOrder);
router.post('/updatetransactionstatus', userAuthentication.authenticate, razorpayController.updateTransactionStatus);

module.exports = router;