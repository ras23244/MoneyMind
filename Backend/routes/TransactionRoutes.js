const express = require('express')
const router = express.Router()
const protect = require('../middlewares/authMiddleware');
const Transaction = require('../models/TransactionModel');
const TransactionController = require('../controllers/TransactionController');
const { exportLimiter,generalLimiter } = require('../middlewares/rateLimiter');

router.post('/create-transaction', protect, generalLimiter, TransactionController.createTransaction);
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