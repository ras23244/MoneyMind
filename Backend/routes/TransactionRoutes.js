const express = require('express')
const router = express.Router()
const protect = require('../middlewares/authMiddleware');
const Transaction = require('../models/TransactionModel');
const TransactionController = require('../controllers/TransactionController');
const { exportLimiter,generalLimiter } = require('../middlewares/rateLimiter');
const { body } = require('express-validator');

router.post('/create-transaction', protect, generalLimiter, [
    body('bankAccountId')
        .optional()
        .isMongoId()
        .withMessage('Invalid bank account ID'),

    body('description')
        .notEmpty()
        .withMessage('Description is required')
        .isString()
        .trim(),

    body('amount')
        .notEmpty()
        .withMessage('Amount is required')
        .isNumeric()
        .withMessage('Amount must be a number'),

    body('type')
        .notEmpty()
        .withMessage('Transaction type is required')
        .isIn(['income', 'expense'])
        .withMessage('Type must be income or expense'),

    body('category')
        .notEmpty()
        .withMessage('Category is required')
        .isString(),

    body('note')
        .optional()
        .isString()
        .trim(),

    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),

    body('tags.*')
        .optional()
        .isString()
        .withMessage('Each tag must be a string'),

    body('date')
        .optional()
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Date must be in YYYY-MM-DD format')
        .custom((value) => {
            const d = new Date(value);
            if (isNaN(d.getTime())) throw new Error('Invalid date');
            return true;
        })
        .customSanitizer((value) => new Date(value)),
],
     TransactionController.createTransaction);
router.post('/bulk-create-transactions', protect, exportLimiter, TransactionController.bulkCreateTransactions);
router.get('/get-transactions', protect, generalLimiter, TransactionController.getTransactions);
router.get('/get-transaction/:id', protect, generalLimiter, TransactionController.getTransactionById);
router.put('/update-transaction/:id', protect, generalLimiter, TransactionController.updateTransaction);
router.delete('/delete-transaction/:id', protect, generalLimiter, TransactionController.deleteTransaction);
router.get('/export', protect, exportLimiter, TransactionController.exportTransactions);
router.get("/trends", protect, generalLimiter, TransactionController.getTransactionTrends);
router.get("/forecast", protect, generalLimiter, TransactionController.getForecast);
router.get("/financial-summary", protect, generalLimiter, TransactionController.getFinancialSummary);
router.get("/category-breakdown", protect, generalLimiter, TransactionController.getCategoryBreakdown);
router.get("/category-aggregation", protect, generalLimiter, TransactionController.getCategoryAggregation);
router.get("/spending-heatmap", protect, generalLimiter, TransactionController.getSpendingHeatmap);
router.get("/trend-data", protect, generalLimiter, TransactionController.getTrendData);
router.get('/get-account-transactions/:accountId', protect, generalLimiter, TransactionController.getAccountTransactions);

module.exports = router;