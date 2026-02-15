const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 50, unread } = req.query;
    const q = { userId };
    if (unread === 'true') q.read = false;
    const notifications = await Notification.find(q).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.markRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;
    const n = await Notification.findOneAndUpdate({ _id: id, userId }, { read: true, readAt: new Date() }, { new: true });
    if (!n) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: n });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany({ userId, read: false }, { read: true, readAt: new Date() });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;
    await Notification.findOneAndDelete({ _id: id, userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
