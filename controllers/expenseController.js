const Expense = require('../models/expenseModel');
const User = require('../models/userModel');
const sequelize = require('../utils/database');
const UserServices = require('../services/userservices');
const S3service = require('../services/S3services');

// Download Expenses
exports.downloadExpenses = async (req, res) => {
    try {
        const expenses = await UserServices.getExpenses(req);
        const stringifiedExpenses = JSON.stringify(expenses);

        const userId = req.user.id;
        const filename = `Expense${userId}/${new Date().toISOString()}.txt`;
        const fileURL = await S3service.uploadToS3(stringifiedExpenses, filename);
        res.status(200).json({ fileURL, success: true });
    } catch (err) {
        res.status(500).json({ fileURL: '', success: false, message: err.message });
    }
};

// Add Expense
exports.addExpense = async (req, res) => {
    let t;
    try {
        const { price, description, category } = req.body;

        if (!price || !description || !category) {
            return res.status(400).json({ success: false, message: "Invalid input data" });
        }

        t = await sequelize.transaction();

        const expense = await Expense.create(
            { price, description, category, userId: req.user.id },
            { transaction: t }
        );

        const totalExpense = Number(req.user.totalExpenses) + Number(price);
        await User.update({ totalExpenses: totalExpense }, { where: { id: req.user.id }, transaction: t });

        await t.commit();
        res.status(201).json({ success: true, expense });
    } catch (err) {
        if (t) {
            await t.rollback();
        }
        console.error("Error adding expense:", err.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get Expenses with Pagination and Filtering
exports.getExpenses = async (req, res) => {
    try {
        const { filter = 'all', page = 1, limit = 10 } = req.query; // Default page and limit if not provided
        const offset = (page - 1) * limit;

        let whereCondition = { userId: req.user.id };

        // Apply filters based on user selection
        if (filter === 'daily') {
            const today = new Date().setHours(0, 0, 0, 0);
            whereCondition.createdAt = { $gte: today };
        } else if (filter === 'weekly') {
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            whereCondition.createdAt = { $gte: lastWeek };
        } else if (filter === 'monthly') {
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            whereCondition.createdAt = { $gte: lastMonth };
        }

        // Fetch expenses with pagination
        const { count, rows: expenses } = await Expense.findAndCountAll({
            where: whereCondition,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.status(200).json({
            success: true,
            totalItems: count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            expenses,
        });
    } catch (err) {
        console.error("Error fetching expenses:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete Expense
exports.deleteExpense = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const id = req.params.id;

        const expense = await Expense.findOne({
            where: { id, userId: req.user.id },
            transaction: t,
        });
        if (!expense) {
            await t.rollback();
            return res.status(404).json({ success: false, message: "Expense not found or does not belong to the user" });
        }

        await Expense.destroy({ where: { id }, transaction: t });

        const updatedTotalExpense = Number(req.user.totalExpenses) - Number(expense.price);
        await User.update({ totalExpenses: updatedTotalExpense }, { where: { id: req.user.id }, transaction: t });

        await t.commit();
        res.status(200).json({ success: true, message: "Expense deleted successfully" });
    } catch (err) {
        await t.rollback();
        console.error("Error deleting expense:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};