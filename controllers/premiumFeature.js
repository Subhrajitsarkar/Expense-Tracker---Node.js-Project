let User = require('../models/userModel')
let Expense = require('../models/expenseModel')
let sequelize = require('../utils/database')

const getUserLeaderBoard = async (req, res) => {
    try {
        let leaderboardofusers = await User.findAll({
            attributes: ['id', 'name', [sequelize.fn('sum', sequelize.col('expenses.price')), 'total_cost']],
            include: [
                {
                    model: Expense,
                    attributes: []
                }
            ],
            group: ['user.id'], // Ensure grouping matches the user alias
            order: [['total_cost', 'DESC']] //(or) order: [[sequelize.literal('total_cost'), 'DESC']], // Sort by aggregated column
        })
        // Check if leaderboard has any data
        if (leaderboardofusers.length === 0) {
            return res.status(200).json({ message: "No data found", leaderboard: [] });
        }
        res.status(200).json(leaderboardofusers);

    } catch (err) {
        console.log(err);
        res.status(500).json(err)
    }
}
module.exports = {
    getUserLeaderBoard
};