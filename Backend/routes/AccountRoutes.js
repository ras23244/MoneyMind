const express = require('express')
const router = express.Router()
const protect = require('../middlewares/authMiddleware');
const AccountController = require('../controllers/AccountController');

// Define your account-related routes here
router.post('/link-bank-account', protect, AccountController.linkBankAccount);

router.get('/get-accounts', protect, AccountController.getAccounts);

// router.get('/accounts/:id', protect, AccountController.getAccountById);



module.exports = router
