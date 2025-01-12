const express = require('express');
const expenseController = require('../controllers/expenseController');
const userauthentication = require('../middleware/auth');

const router = express.Router();

router.post('/add-expense', userauthentication.authenticate, expenseController.addExpense);
router.get('/get-expenses', userauthentication.authenticate, expenseController.getExpenses);
router.delete('/get-expense/:id', userauthentication.authenticate, expenseController.deleteExpense)
router.get('/download', userauthentication.authenticate, expenseController.downloadExpenses)


module.exports = router;
