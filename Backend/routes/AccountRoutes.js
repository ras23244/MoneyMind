const express = require('express')
const router = express.Router()
const protect = require('../middlewares/authMiddleware');
const AccountController = require('../controllers/AccountController');
const { generalLimiter } = require('../middlewares/rateLimiter');
const { body } = require('express-validator');


router.post('/link-bank-account', protect, generalLimiter, [
    body('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email address')
        .normalizeEmail(),

    body('bankName')
        .notEmpty()
        .withMessage('Bank name is required')
        .isString()
        .withMessage('Bank name must be a string')
        .trim(),

    body('accountNumber')
        .notEmpty()
        .withMessage('Account number is required')
        .isString()
        .withMessage('Account number must be a string')
        .trim()
        .isLength({ min: 4, max: 10 })
        .withMessage('Account number length is invalid'),
], AccountController.linkBankAccount);
router.post('/unlink-bank-account', protect, generalLimiter, AccountController.unlinkAccount);

router.get('/get-accounts', protect, generalLimiter, AccountController.getAccounts);
router.get('/get-account-stats', protect, generalLimiter, AccountController.getAccountStats);
router.put('/update-account/:id', protect, generalLimiter, AccountController.updateAccount);
router.delete('/delete-account/:id', protect, generalLimiter, AccountController.deleteAccount);


module.exports = router
