const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

const protect = async (req, res, next) => {
    let token;

    // Check for token in HTTP-only cookie first (secure)
    if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
    }
    // Fallback to Authorization header for socket.io and other cases
    else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }
        next();
    } catch (err) {
        // If access token expired, return 401 to trigger refresh
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired", code: "TOKEN_EXPIRED" });
        }
        return res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = protect;
