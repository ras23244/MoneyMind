const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const BudgetController = require('../controllers/BudgetController');
const { generalLimiter } = require('../middlewares/rateLimiter');

router.get('/get-budgets', protect, generalLimiter, BudgetController.getBudgets);
router.post('/create-budget', protect, generalLimiter, BudgetController.createBudget);
router.put('/update-budget/:id', protect, generalLimiter, BudgetController.updateBudget);
router.delete('/delete-budget/:id', protect, generalLimiter, BudgetController.deleteBudget);

module.exports = router;