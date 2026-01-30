const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const BillController = require('../controllers/BillController');


router.get('/get-bills', protect, BillController.getUpcomingBills);
router.post('/create-bill', protect, BillController.createBill);
router.patch('/update-bill/:id/status', protect, BillController.updateBillStatus);
router.patch('/update-bill/:id/autopay', protect, BillController.toggleAutopay);
router.delete('/delete-bill/:id', protect, BillController.deleteBill);
router.get('/summary', protect, BillController.getBillSummary);

module.exports = router;