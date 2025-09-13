const express = require('express')
const UserModel = require('../models/UserModel');
const AccountModel = require('../models/AccountModel');

exports.linkBankAccount = async (req, res) => {
    const { email, bankName, accountNumber } = req.body;

    if (!email || !bankName || !accountNumber) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Find the user by email
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a new account
        const newAccount = new AccountModel({
            userId: user._id,
            bankName,
            accountNumber,
        });

        await newAccount.save();

        // Update user and return updated document with populated bankAccounts
        const updatedUser = await UserModel.findByIdAndUpdate(
            user._id,
            { $push: { bankAccounts: newAccount._id } },
            { new: true }
        ).populate('bankAccounts'); // populate bank accounts if it's a ref

        res.status(201).json({
            message: 'Bank account linked successfully',
            user: updatedUser,
        });
    } catch (error) {
        console.error('Error linking bank account:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
