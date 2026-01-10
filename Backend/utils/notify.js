const Notification = require('../models/Notification');
const socketUtil = require('./socket');

/**
 * Create a notification document and emit to user's socket room if connected.
 * @param {Object} opts { userId, type, title, body, data, priority }
 */
async function notify(opts = {}) {
  const { userId, type, title, body, data = {}, priority = 'low' } = opts;
  if (!userId || !type || !title) throw new Error('notify: missing required fields');

  const doc = await Notification.create({ userId, type, title, body, data, priority });

  const io = socketUtil.getIO();
  const payload = {
    id: doc._id.toString(),
    type: doc.type,
    title: doc.title,
    body: doc.body,
    data: doc.data,
    priority: doc.priority,
    read: doc.read,
    createdAt: doc.createdAt,
  };

  try {
    if (io) {
      io.to(`user:${userId}`).emit('notification', payload);
      // Optionally mark delivered channel
      await Notification.findByIdAndUpdate(doc._id, { $addToSet: { delivered: 'in-app' } });
    }
  } catch (e) {
    console.error('Error emitting notification', e.message);
  }

  return doc;
}

module.exports = notify;
