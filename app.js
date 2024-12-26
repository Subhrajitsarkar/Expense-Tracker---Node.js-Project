let express = require('express')
let app = express()

let bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

let cors = require('cors')
app.use(cors())

let path = require('path')
app.use(express.static(path.join(__dirname, 'public')))

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

sequelize.sync()
    .then(() => {
        app.listen(3000, () => console.log('server running at PORT 3000'))
    })
    .catch(err => console.log('error in sync', err))