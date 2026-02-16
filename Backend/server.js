const http = require('http');
const app = require('./app');
// const logger = require('./logger');
const socketUtil = require('./utils/socket');
const socketAuth = require('./middlewares/socketAuth');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// initialize socket.io and apply auth middleware
const io = socketUtil.init(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: false,
    }
});

io.use(socketAuth);

io.on('connection', (socket) => {
    // keep minimal logging here
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});