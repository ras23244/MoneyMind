/**
 * Centralized Error Handler Middleware
 * Should be the last middleware in app.js
 */

module.exports = (err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Log error only in development
    if (process.env.NODE_ENV !== 'production') {
        console.error('[ERROR]', {
            status,
            message,
            stack: err.stack,
            url: req.url,
            method: req.method,
        });
    } else {
        // In production, log essential info only (no stack traces)
        console.error(`[${status}] ${message} - ${req.method} ${req.url}`);
    }

    // Don't expose internal error details in production
    const responseMessage = process.env.NODE_ENV === 'production' && status === 500
        ? 'Internal Server Error'
        : message;

    res.status(status).json({
        success: false,
        message: responseMessage,
        ...(process.env.NODE_ENV !== 'production' && { debug: err.stack })
    });
};
