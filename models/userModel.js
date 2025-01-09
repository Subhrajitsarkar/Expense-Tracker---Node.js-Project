let Sequelize = require('sequelize')
let sequelize = require('../utils/database')

let User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    ispremiumuser: Sequelize.BOOLEAN,
    totalExpenses: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    }
})
module.exports = User