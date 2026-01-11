const express = require('express')
const router = express.Router()
const protect = require('../middlewares/authMiddleware');
const Transaction = require('../models/TransactionModel');
const TransactionController = require('../controllers/TransactionController');

router.post('/create-transaction', protect, TransactionController.createTransaction);
router.post('/bulk-create-transactions', protect, TransactionController.bulkCreateTransactions);
router.get('/get-transactions', protect, TransactionController.getTransactions);
router.get('/get-transaction/:id', protect, TransactionController.getTransactionById);
router.put('/update-transaction/:id', protect, TransactionController.updateTransaction);
router.delete('/delete-transaction/:id', protect, TransactionController.deleteTransaction);


router.get('/filter-transactions', protect, TransactionController.filterTransactions);

router.get('/export', protect, TransactionController.exportTransactions);

router.get("/trends", protect, TransactionController.getTransactionTrends);

router.get("/financial-summary", protect, TransactionController.getFinancialSummary);

router.get("/category-breakdown", protect, TransactionController.getCategoryBreakdown);
router.get("/category-aggregation", protect, TransactionController.getCategoryAggregation);
router.get("/spending-heatmap", protect, TransactionController.getSpendingHeatmap);
router.get("/trend-data", protect, TransactionController.getTrendData);
router.get('/get-account-transactions/:accountId', protect, TransactionController.getAccountTransactions);

module.exports = router;