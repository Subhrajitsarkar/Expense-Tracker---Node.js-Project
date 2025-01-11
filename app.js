const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const sequelize = require('./utils/database');
const User = require('./models/userModel');
const Expense = require('./models/expenseModel');
const Order = require('./models/orderModel');
const Forgotpassword = require('./models/forgotpassword');
require('dotenv').config();

// Routers
const signupRouter = require('./routers/signupRouter');
const loginRouter = require('./routers/loginRouter');
const expenseRouter = require('./routers/expenseRouter');
const razorpayRouter = require('./routers/razorpayRouter');
const premiumFeatureRoutes = require('./routers/premiumFeature')
const resetPasswordRoutes = require('./routers/resetpassword')

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

// Use routers
app.use('/user', signupRouter);
app.use('/user', loginRouter);
app.use('/expense', expenseRouter);
app.use('/razorpay', razorpayRouter);
app.use('/premium', premiumFeatureRoutes)
app.use('/password', resetPasswordRoutes);

//The Expense model is designed to store information related to expenses created by users.
User.hasMany(Expense);
Expense.belongsTo(User);

//The Order model is designed to store information related to payment transactions (e.g., Razorpay orders).
User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);

// Sync database and start the server
sequelize.sync()
    .then(() => {
        app.listen(3000, () => console.log('Server running at PORT 3000'));
    })
    .catch((err) => console.error('Error in syncing database:', err.message));
