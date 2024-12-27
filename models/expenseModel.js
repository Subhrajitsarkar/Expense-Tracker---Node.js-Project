let Sequelize = require('sequelize');
let sequelize = require('../utils/database');

let Expense = sequelize.define('expense', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    price: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    },
    category: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Expense;
