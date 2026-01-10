const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const controller = require('../controllers/NotificationController');

router.use(protect);

router.get('/', controller.getNotifications);
router.patch('/:id/read', controller.markRead);
router.patch('/read-all', controller.markAllRead);
router.delete('/:id', controller.deleteNotification);

module.exports = router;
