const jwt = require('jsonwebtoken');

// Generate short-lived access token (1 hour)
const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '1h',
        algorithm: 'HS256',
    });
};

// Generate long-lived refresh token (7 days)
const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET, {
        expiresIn: '7d',
        algorithm: 'HS256',
    });
};

// Generate both tokens
const generateTokens = (userId) => {
    return {
        accessToken: generateAccessToken(userId),
        refreshToken: generateRefreshToken(userId),
    };
};

module.exports = { generateAccessToken, generateRefreshToken, generateTokens };