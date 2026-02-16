const User = require('../models/UserModel');
const { generateTokens } = require('../utils/generateToken');
const sendMail = require('../utils/sendMail');
const bcrypt = require('bcrypt');
const Account = require('../models/AccountModel');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;
        const { firstname, lastname } = fullname || {};
        const userExists = await User.findOne({ email });

        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({
            fullname: { firstname, lastname },
            email: email.toLowerCase(),
            password: password
        });

        const tokens = generateTokens(user._id);

        res.status(201).json({
            message: 'User registered successfully',
            tokens,
            user: {
                _id: user._id,
                name: `${user.fullname.firstname} ${user.fullname.lastname}`,
                email: user.email
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const tokens = generateTokens(user._id);

        res.status(200).json({
            message: 'Login successful',
            tokens,
            user: {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                bankAccounts: user.bankAccounts || []
            }
        });

    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.logout = (req, res) => {
    // Stateless: client clears tokens
    res.status(200).json({ message: 'Logged out successfully' });
};

exports.refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.headers['x-refresh-token'] || req.body?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: 'No refresh token provided' });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        const tokens = generateTokens(user._id);

        res.status(200).json({ message: 'Token refreshed successfully', tokens });
    } catch (err) {
        return res.status(401).json({ message: 'Invalid refresh token' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password').populate({ path: 'bankAccounts', select: 'accountNumber bankName balance' });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.forgetPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const userOtp = user.password_otp?.otp;
        if (userOtp) {
            const timeDiff = new Date().getTime() - new Date(user.password_otp.last_attempt).getTime() <= 24 * 60 * 60 * 1000;

            if (!timeDiff) {
                user.password_otp.limit = 5
                await user.save();
            }

            const remainingLimit = user.password_otp.limit === 0;
            if (timeDiff && remainingLimit) {
                return res.status(400).json({ message: 'OTP request limit reached. Please try again after 24 hours.' });
            }
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.password_otp.otp = otp;
        user.password_otp.limit--;
        user.password_otp.last_attempt = new Date();
        user.password_otp.send_time = new Date().getTime() + 5 * 60 * 1000;
        await user.save();

        const result = await sendMail({
            email: user.email,
            otp: otp
        });

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.verifyOtp = async (req, res) => {
    const { otp } = req.body;
    try {
        const user = await User.findOne({ 'password_otp.otp': otp });
        if (!user) return res.status(404).json({ message: 'Invalid OTP' });

        const currentTime = new Date().getTime();
        if (currentTime > user.password_otp.send_time) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        user.password_otp.otp = null;
        user.password_otp.limit = 5;
        user.password_otp.last_attempt = null;
        user.password_otp.send_time = null;
        await user.save();

        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

exports.getTime = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const time = user.password_otp.send_time;
        res.status(200).json({ message: "otp sent", time });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

exports.updatePassword = async (req, res) => {
    try {
        const { email, currentPassword, password: newPassword } = req.body;

        if (!email || !currentPassword || !newPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};
