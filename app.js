let express = require('express');
let app = express();

let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let cors = require('cors');
app.use(cors());

let path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

let bcrypt = require('bcrypt');
let User = require('./models/userModel');
let Expense = require('./models/expenseModel');
let sequelize = require('./utils/database');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'login.html'));
});

app.get('/expense', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'expense.html'));
});


app.post('/user/signup', async (req, res, next) => {
    try {
        let { name, email, password } = req.body;

        let hashedPassword = await bcrypt.hash(password, 10);

        let data = await User.create({ name, email, password: hashedPassword });
        res.status(201).json({ data });
    } catch (err) {
        console.error('Error in signup:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post('/user/login', async (req, res, next) => {
    try {
        let { email, password } = req.body;

        let user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User does not exist' });
        }

        let isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            res.status(200).json({ success: true, message: "User logged in successfully" });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (err) {
        console.error('Error in login:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/expense/add-expense', async (req, res) => {
    try {
        let { price, description, category } = req.body;
        let data = await Expense.create({ price, description, category });
        res.status(201).json({ success: true, data });
    } catch (err) {
        console.error('Error adding expense:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/expense/get-expenses', async (req, res) => {
    try {
        let expenses = await Expense.findAll();
        res.status(200).json(expenses);
    } catch (err) {
        console.error('Error fetching expenses:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.delete('/expense/get-expense/:id', async (req, res) => {
    try {
        let id = req.params.id;
        let result = await Expense.destroy({ where: { id } });
        if (result) {
            res.status(200).json({ success: true, message: 'Expense deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Expense not found' });
        }
    } catch (err) {
        console.error('Error deleting expense:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

sequelize.sync()
    .then(() => {
        app.listen(3000, () => console.log('Server running at PORT 3000'));
    })
    .catch(err => console.error('Error in syncing database:', err.message));
