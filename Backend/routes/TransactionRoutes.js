const express=require('express')
const router=express.Router()
const protect = require('../middlewares/authMiddleware');
const Transaction = require('../models/TransactionModel');
const TransactionController = require('../controllers/TransactionController');

router.post('/create-transaction', protect, TransactionController.createTransaction);
router.get('/get-transactions', protect, TransactionController.getTransactions);
router.get('/get-transaction/:id',protect,TransactionController.getTransactionById);
router.put('/update-transaction/:id', protect, TransactionController.updateTransaction);
router.delete('/delete-transaction/:id', protect, TransactionController.deleteTransaction);

//filter transactions based on tags or category
router.get('/filter-transactions', protect, TransactionController.filterTransactions);

router.get("/trends", protect, TransactionController.getTransactionTrends);

module.exports=router;