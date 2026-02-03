const express = require('express');
const router = express.Router();
const authController = require('../controllers/UserController');
const protect = require('../middlewares/authMiddleware');
const { body } = require('express-validator')
const { authLimiter,generalLimiter } = require('../middlewares/rateLimiter');

router.post('/register', authLimiter, [
    body('email').isEmail().withMessage('Invalid Email'),
    body('fullname.firstname').isLength({ min: 3 }).withMessage('First name should be at least 3 characters long'),
    body('fullname.lastname').isLength({ min: 3 }).withMessage('Last name should be at least 3 characters long'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
],
    authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/logout', authLimiter, authController.logout);
router.post('/refresh-token', authLimiter, authController.refreshAccessToken);
router.get('/me', protect, generalLimiter, authController.getMe);
router.post('/forget-password', authLimiter, authController.forgetPassword);
router.post('/verify-otp', authLimiter, authController.verifyOtp);
router.post('/get-time', authLimiter, authController.getTime);
router.put("/update-password", authLimiter, authController.updatePassword);

module.exports = router;
