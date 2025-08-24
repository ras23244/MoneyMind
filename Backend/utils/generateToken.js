const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    const token = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN_KEY, {
        expiresIn: '7d',
    });
    return token;
};

module.exports = generateToken;