const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const controller = require('../controllers/NotificationController');
const { generalLimiter } = require('../middlewares/rateLimiter');

router.use(protect);

router.get('/', protect, generalLimiter, controller.getNotifications);
router.patch('/:id/read', protect, generalLimiter, controller.markRead);
router.patch('/read-all', protect, generalLimiter, controller.markAllRead);
router.delete('/:id', protect, generalLimiter, controller.deleteNotification);

module.exports = router;
