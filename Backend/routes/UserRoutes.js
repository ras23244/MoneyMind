const express = require('express');
const router = express.Router();
const authController = require('../controllers/UserController');
const protect = require('../middlewares/authMiddleware');
const { body } = require('express-validator')

router.post('/register', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('fullname.firstname').isLength({ min: 3 }).withMessage('First name should be at least 3 characters long'),
    body('fullname.lastname').isLength({ min: 3 }).withMessage('Last name should be at least 3 characters long'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
],
    authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);
router.post('/forget-password', authController.forgetPassword);
router.post('/verify-otp', authController.verifyOtp);
router.post('/get-time', authController.getTime);
router.put("/update-password", authController.updatePassword);

module.exports = router;
