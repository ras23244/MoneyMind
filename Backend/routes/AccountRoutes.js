const express = require('express')
const router = express.Router()
const protect = require('../middlewares/authMiddleware');
const AccountController = require('../controllers/AccountController');

// Define your account-related routes here
router.post('/link-bank-account', protect, AccountController.linkBankAccount);
router.post('/unlink-bank-account', protect, AccountController.unlinkAccount);

router.get('/get-accounts', protect, AccountController.getAccounts);
router.get('/get-account-stats', protect, AccountController.getAccountStats);
router.put('/update-account/:id', protect, AccountController.updateAccount);
router.delete('/delete-account/:id', protect, AccountController.deleteAccount);

// router.get('/accounts/:id', protect, AccountController.getAccountById);



module.exports = router
