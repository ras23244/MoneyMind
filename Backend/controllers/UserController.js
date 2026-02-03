const express = require('express');
const User = require('../models/UserModel');
const { generateTokens } = require('../utils/generateToken');
const sendMail = require('../utils/sendMail');
const bcrypt = require('bcrypt');
const Account = require('../models/AccountModel');
const jwt = require('jsonwebtoken');

// Helper to set secure HTTP-only cookies
const setAuthCookies = (res, tokens) => {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: isProduction, // Only HTTPS in production
        sameSite: 'strict', // CSRF protection
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: '/',
    });

    res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
    });
};

exports.register = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;
        const { firstname, lastname } = fullname;
        const userExists = await User.findOne({ email });

        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({
            fullname: { firstname, lastname },
            email: email.toLowerCase(),
            password: password
        });

        const tokens = generateTokens(user._id);
        setAuthCookies(res, tokens);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                _id: user._id,
                name: `${user.fullname.firstname} ${user.fullname.lastname}`,
                email: user.email
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        console.log('User found during login:', user);

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const tokens = generateTokens(user._id);
        setAuthCookies(res, tokens);

        res.status(200).json({
            message: 'Login successful',
            tokens : tokens,
            user: {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                bankAccounts: user.bankAccounts || []
            }
        });

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.logout = (req, res) => {
    // Clear HTTP-only cookies
    res.clearCookie('accessToken', { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.clearCookie('refreshToken', { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.status(200).json({ message: 'Logged out successfully' });
};

exports.refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: 'No refresh token provided' });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        const tokens = generateTokens(user._id);
        setAuthCookies(res, tokens);

        res.status(200).json({ message: 'Token refreshed successfully' });
    } catch (err) {
        res.clearCookie('accessToken', { path: '/', httpOnly: true });
        res.clearCookie('refreshToken', { path: '/', httpOnly: true });
        return res.status(401).json({ message: 'Invalid refresh token' });
    }
};

exports.getMe = async (req, res) => {

    let user = await User.findById(req.user.id).select('-password');

    if (user.bankAccounts && user.bankAccounts.length > 0) {
        const rawBankAccounts = user.bankAccounts.map(b => (b && b._id) ? b._id.toString() : b.toString());
        const existingAccounts = await Account.find({ _id: { $in: rawBankAccounts }, userId: user._id }).select('_id');
        const existingIds = existingAccounts.map(a => a._id.toString());
        const uniqueAccountIds = [...new Set(existingIds)];

        if (uniqueAccountIds.length !== rawBankAccounts.length) {
            await User.findByIdAndUpdate(user._id, { bankAccounts: uniqueAccountIds }).exec();

            user = await User.findById(req.user.id).select('-password').populate({ path: 'bankAccounts', select: 'accountNumber bankName balance' });
            return res.status(200).json(user);
        }
    }

    await user.populate({ path: 'bankAccounts', select: 'accountNumber bankName balance' });
    res.status(200).json(user);
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
        console.log(error)
        res.status(500).json({ message: 'Server error', error: error.message });
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
        console.error("Update password error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
