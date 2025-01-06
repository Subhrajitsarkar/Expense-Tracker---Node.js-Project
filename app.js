const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const sequelize = require('./utils/database');
const User = require('./models/userModel');
const Expense = require('./models/expenseModel');
const Order = require('./models/orderModel');
require('dotenv').config();

const expenseRouter = require('./routers/expenseRouter');
const signupRouter = require('./routers/signupRouter');
const loginRouter = require('./routers/loginRouter');

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

// Routers
app.use('/user', signupRouter);
app.use('/user', loginRouter);
app.use('/expense', expenseRouter);

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

sequelize.sync()
    .then(() => {
        app.listen(3000, () => console.log('Server running at PORT 3000'));
    })
    .catch((err) => console.error('Error in syncing database:', err.message));
