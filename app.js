const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('./utils/database');
const User = require('./models/userModel');
const Expense = require('./models/expenseModel');
const Order = require('./models/orderModel')
const userauthentication = require('./middleware/auth');
const Razorpay = require('razorpay')
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'login.html'));
});

app.get('/expense', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'expense.html'));
});

app.post('/user/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const data = await User.create({ name, email, password: hashedPassword });
        res.status(201).json({ data });
    } catch (err) {
        console.error('Error in signup:', err.message);
        res.status(500).json({ error: err.message });
    }
});

function generateAccessToken(id, name) {
    return jwt.sign({ userId: id, name }, process.env.JWT_SECRET);
}

app.post('/user/login', async (req, res) => {
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
                token: generateAccessToken(user.id, user.name),
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Error in login:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/expense/add-expense', userauthentication.authenticate, async (req, res) => {
    try {
        const { price, description, category } = req.body;

        if (!price || !description || !category) {
            return res.status(400).json({ success: false, message: "Invalid input data" });
        }

        const expense = await Expense.create({
            price,
            description,
            category,
            userId: req.user.id,
        });

        res.status(201).json({ success: true, expense });
    } catch (err) {
        console.error("Error adding expense:", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});


app.get('/expense/get-expenses', userauthentication.authenticate, async (req, res) => {
    try {
        const expenses = await Expense.findAll({ where: { userId: req.user.id } });
        res.status(200).json(expenses);
    } catch (err) {
        console.error('Error fetching expenses:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.delete('/expense/get-expense/:id', userauthentication.authenticate, async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Expense.destroy({ where: { id, userId: req.user.id } });

        if (result === 0) {
            return res.status(404).json({ success: false, message: 'Expense does not belong to user' });
        }

        res.status(200).json({ success: true, message: 'Expense deleted successfully' });
    } catch (err) {
        console.error('Error deleting expense:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/premiummembership', userauthentication.authenticate, async (req, res) => {
    try {
        console.log('Creating Razorpay order'); // Log the start of the process

        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const amount = 1000;
        const options = {
            amount: amount,
            currency: 'INR',
            receipt: `order_rcptid_${new Date().getTime()}`,
        };

        const order = await rzp.orders.create(options);
        console.log('Razorpay order created:', order); // Log the created order

        await req.user.createOrder({ orderid: order.id, status: 'PENDING' });

        res.status(201).json({ order, key_id: rzp.key_id });
    } catch (err) {
        console.error('Error in creating Razorpay order:', err.message);
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
});
app.post('/updatetransactionstatus', userauthentication.authenticate, async (req, res) => {
    try {
        const { payment_id, order_id } = req.body;

        const order = await Order.findOne({ where: { orderid: order_id } });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const promise1 = order.update({ paymentid: payment_id, status: 'SUCCESSFUL' });
        const promise2 = req.user.update({ ispremiumuser: true });

        await Promise.all([promise1, promise2]);

        res.status(202).json({ success: true, message: 'Transaction Successful' });
    } catch (err) {
        console.error('Error in updating transaction status:', err.message);
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
})

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order)
Order.belongsTo(User)

sequelize.sync()
    .then(() => {
        app.listen(3000, () => console.log('Server running at PORT 3000'));
    })
    .catch((err) => console.error('Error in syncing database:', err.message));
