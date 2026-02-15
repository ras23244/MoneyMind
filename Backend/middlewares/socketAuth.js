const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

module.exports = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || (socket.handshake.headers && socket.handshake.headers.authorization ? socket.handshake.headers.authorization.split(' ')[1] : null);
    if (!token) return next(new Error('Authentication error'));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new Error('User not found'));
    socket.user = { id: user._id.toString() };
    // join a private room for this user
    socket.join(`user:${user._id.toString()}`);
    return next();
  } catch (err) {
    return next(new Error('Authentication error'));
  }
};
