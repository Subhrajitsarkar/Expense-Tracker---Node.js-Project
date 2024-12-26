let express = require('express')
let app = express()

let bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

let cors = require('cors')
app.use(cors())

let path = require('path')
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'login.html'));
});
let User = require('./models/userModel')
let sequelize = require('./utils/database')

app.post('/user/signup', async (req, res, next) => {
    try {
        let { name, email, password } = req.body;
        let data = await User.create({ name, email, password })
        res.status(201).json({ data })
    } catch (err) {
        console.log('error in signup page');
        res.status(500).json({ error: err.message })
    }
})

app.post('/user/login', async (req, res, next) => {
    try {
        let { email, password } = req.body;

        // Fetch user from the database
        let user = await User.findAll({ where: { email } });

        if (user.length === 0) {
            // If user doesn't exist
            return res.status(404).json({ success: false, message: 'User does not exist' });
        }

        // Check password
        if (user[0].password === password) {
            res.status(200).json({ success: true, message: "User logged in successfully" });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (err) {
        console.error('Error in login:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});


sequelize.sync()
    .then(() => {
        app.listen(3000, () => console.log('server running at PORT 3000'))
    })
    .catch(err => console.log('error in sync', err))