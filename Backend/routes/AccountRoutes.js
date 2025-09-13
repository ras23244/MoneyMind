const express = require('express')
const router = express.Router()
const protect = require('../middlewares/authMiddleware');
const AccountController = require('../controllers/AccountController');

// Define your account-related routes here
router.post('/link-bank-account', protect, AccountController.linkBankAccount);

module.exports = router
