const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const BudgetController = require('../controllers/BudgetController');

router.get('/get-budgets', protect, BudgetController.getBudgets);
router.post('/create-budget', protect, BudgetController.createBudget);
router.put('/update-budget/:id', protect, BudgetController.updateBudget);
router.delete('/delete-budget/:id', protect, BudgetController.deleteBudget);

module.exports = router;