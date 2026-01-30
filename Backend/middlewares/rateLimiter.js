const rateLimit = require('express-rate-limit');

exports.generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 300, 
    message: {
        success: false,
        message: 'Too many requests. Please try again later.',
    },
    keyGenerator: (req) =>
        req.user ? `user:${req.user.id}` : `ip:${req.ip}`,
    standardHeaders: true,
    legacyHeaders: false,
});

exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, 
    message: {
        success: false,
        message: 'Too many login attempts. Try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

exports.exportLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, 
    max: 10,
    message: {
        success: false,
        message: 'Too many exports. Please wait.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

