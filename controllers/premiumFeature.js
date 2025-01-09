let User = require('../models/userModel')
let Expense = require('../models/expenseModel')
let sequelize = require('../utils/database')

const getUserLeaderBoard = async (req, res) => {
    try {
        let leaderboardofusers = await User.findAll({
            attributes: [
                'id',
                'name',
                [sequelize.fn('COALESCE', sequelize.fn('sum', sequelize.col('expenses.price')), 0), 'total_cost']],
            include: [
                {
                    model: Expense,
                    attributes: []
                }
            ],
            group: ['user.id'], // Group by user ID
            order: [[sequelize.literal('total_cost'), 'DESC']] // Order by total cost
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