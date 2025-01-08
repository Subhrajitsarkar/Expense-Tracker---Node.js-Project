let User = require('../models/userModel')
let Expense = require('../models/expenseModel')
let sequelize = require('../utils/database')
let e = require('express')

const getUserLeaderBoard = async (req, res) => {
    try {
        let users = await User.findAll()
        let expenses = await Expense.findAll()
        let userAggregatedExpenses = {}
        console.log(expenses);
        expenses.forEach((expenses) => {

            if (userAggregatedExpenses[expenses.userId]) {
                userAggregatedExpenses[expenses.userId] = userAggregatedExpenses[expenses.userId] += expenseModel.price
            }
            else {
                userAggregatedExpenses[expenses.userId] = expenseModel.price;
            }
        })
        var userLeaderBoardDetails = [];

        // Iterate through all users to prepare leaderboard data
        users.forEach((user) => {
            userLeaderBoardDetails.push({
                name: user.name,
                total_cost: userAggregatedExpenses[user.id] || 0 // Default to 0 if no expenses found
            });
        });

        // Log the leaderboard data before sorting
        console.log(userLeaderBoardDetails);

        // Sort users in descending order of total cost
        userLeaderBoardDetails.sort((a, b) => b.total_cost - a.total_cost);

        // Return the sorted leaderboard as a JSON response
        res.status(200).json(userLeaderBoardDetails);

    } catch (err) {
        console.log(err);
        res.status(500).json(err)
    }
}
module.exports = {
    getUserLeaderBoard
};