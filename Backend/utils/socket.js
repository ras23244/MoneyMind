let io = null;

module.exports = {
  init: (server, opts = {}) => {
    const { Server } = require('socket.io');
    io = new Server(server, opts);
    io.on('connection', (socket) => {
      try {
        // Socket connected
      } catch (e) {
        /* ignore */
      }
    });
    return io;
  },
  getIO: () => io,
};
