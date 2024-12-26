let Sequelize = require('sequelize')
let sequelize = new Sequelize('expense', 'root', 'password', {
    dialect: 'mysql',
    host: 'localhost'
})
module.exports = sequelize