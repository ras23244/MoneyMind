const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const BudgetController = require('../controllers/BudgetController');
const { generalLimiter } = require('../middlewares/rateLimiter');
const { body } = require('express-validator');

router.get('/get-budgets', protect, generalLimiter, BudgetController.getBudgets);
router.post('/create-budget', protect, generalLimiter,[
    body('category')
        .notEmpty()
        .withMessage('Category is required')
        .isString()
        .withMessage('Category must be a string')
        .trim(),
    body("amount")
        .isFloat({ gt: 0 })
        .withMessage("Amount must be greater than 0"),
    body("spent").optional().isFloat({min:0}).withMessage("Spent amount cannot be negative"),

], BudgetController.createBudget);
router.put('/update-budget/:id', protect, generalLimiter,[
    body('category')
        .optional()
        .notEmpty()
        .withMessage('Category cannot be empty'),
    body("amount")
        .optional()
        .isFloat({ gt: 0 })
        .withMessage("Amount must be greater than 0"),
    body("spent")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Spent amount cannot be negative"),
], BudgetController.updateBudget);
router.delete('/delete-budget/:id', protect, generalLimiter, BudgetController.deleteBudget);

module.exports = router;