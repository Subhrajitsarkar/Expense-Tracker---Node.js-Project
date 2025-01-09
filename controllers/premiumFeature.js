let User = require('../models/userModel')
let Expense = require('../models/expenseModel')
let sequelize = require('../utils/database')

const getUserLeaderBoard = async (req, res) => {
    try {
        let leaderboardofusers = await User.findAll({
            order: [['totalExpenses', 'DESC']]
        })
        res.status(200).json(leaderboardofusers);
    } catch (err) {
        console.error("Error fetching leaderboard:", err.message);
        res.status(500).json(err)
    }
}
module.exports = {
    getUserLeaderBoard
};