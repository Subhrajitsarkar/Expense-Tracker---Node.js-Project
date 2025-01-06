const Expense = require('../models/expenseModel');

exports.addExpense = async (req, res) => {
    try {
        const { price, description, category } = req.body;

        if (!price || !description || !category) {
            return res.status(400).json({ success: false, message: "Invalid input data" });
        }

        const expense = await Expense.create({
            price,
            description,
            category,
            userId: req.user.id,
        });

        res.status(201).json({ success: true, expense });
    } catch (err) {
        console.error("Error adding expense:", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.findAll({ where: { userId: req.user.id } });
        res.status(200).json(expenses);
    } catch (err) {
        console.error('Error fetching expenses:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Expense.destroy({ where: { id, userId: req.user.id } });

        if (result === 0) {
            return res.status(404).json({ success: false, message: 'Expense does not belong to user' });
        }

        res.status(200).json({ success: true, message: 'Expense deleted successfully' });
    } catch (err) {
        console.error('Error deleting expense:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};
