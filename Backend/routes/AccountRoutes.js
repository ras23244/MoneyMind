const express = require('express')
const router = express.Router()
const protect = require('../middlewares/authMiddleware');
const AccountController = require('../controllers/AccountController');
const { generalLimiter } = require('../middlewares/rateLimiter');


router.post('/link-bank-account', protect, generalLimiter, AccountController.linkBankAccount);
router.post('/unlink-bank-account', protect, generalLimiter, AccountController.unlinkAccount);

router.get('/get-accounts', protect, generalLimiter, AccountController.getAccounts);
router.get('/get-account-stats', protect, generalLimiter, AccountController.getAccountStats);
router.put('/update-account/:id', protect, generalLimiter, AccountController.updateAccount);
router.delete('/delete-account/:id', protect, generalLimiter, AccountController.deleteAccount);


module.exports = router
