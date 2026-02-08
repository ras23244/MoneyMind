const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const BillController = require('../controllers/BillController');
const { generalLimiter } = require('../middlewares/rateLimiter');

router.get('/get-bills', protect, generalLimiter, BillController.getUpcomingBills);
router.post('/create-bill', protect, generalLimiter, BillController.createBill);
router.patch('/update-bill/:id/status', protect, generalLimiter, BillController.updateBillStatus);
router.delete('/delete-bill/:id', protect, generalLimiter, BillController.deleteBill);
router.get('/summary', protect, generalLimiter, BillController.getBillSummary);

module.exports = router; 