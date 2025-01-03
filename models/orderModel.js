let Sequelize = require('sequelize')
let sequelize = require('../utils/database')

//id, name, password, phone no, role

let Order = sequelize.define('order', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    paymentid: Sequelize.STRING,
    orderid: Sequelize.STRING,
    status: Sequelize.STRING
})
module.exports = Order