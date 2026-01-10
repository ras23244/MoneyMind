let io = null;

module.exports = {
  init: (server, opts = {}) => {
    const { Server } = require('socket.io');
    io = new Server(server, opts);
    io.on('connection', (socket) => {
      try {
        console.log('Socket connected:', socket.id);
      } catch (e) {
        consolre.error('Socket connection error', e.message);
        /* ignore */
      }
    });
    return io;
  },
  getIO: () => io,
};
