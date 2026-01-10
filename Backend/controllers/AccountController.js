const UserModel = require('../models/UserModel');
const AccountModel = require('../models/AccountModel');
const TransactionModel = require('../models/TransactionModel');
const notify = require('../utils/notify');

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
        await notify({
            userId: user._id.toString(),
            type: 'account_linked',
            title: 'Account linked',
            body: `${bankName} account linked successfully`,
            data: { accountId: newAccount._id.toString() },
            priority: 'medium'
        });
    } catch (error) {
        console.error('Error linking bank account:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.unlinkAccount = async (req, res) => {
    const { email, bankName, accountNumber, password } = req.body;
    if (!email || !bankName || !accountNumber || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const user = UserModel.findOne({ email }).populate('bankAccounts');
        if (!user) {
            return res.status(400).json({ message: "Wrong email" });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: "Wrong password" });

        // Find the account in user's list
        const accountToRemove = user.bankAccounts.find(
            acc => acc.bankName === bankName && acc.accountNumber === accountNumber
        );

        if (!accountToRemove) {
            return res.status(404).json({ message: "Account not found" });
            await notify({
                userId: user._id.toString(),
                type: 'account_unlinked',
                title: 'Account unlinked',
                body: `${accountToRemove.bankName} account unlinked`,
                data: { accountId: accountToRemove._id.toString() },
                priority: 'low'
            });
        }

        user.bankAccounts = user.bankAccounts.filter(
            acc => acc._id.toString() !== accountToRemove._id.toString()
        )

        await user.save();
        await AccountModel.findByIdAndDelete(accountToRemove._id);

        res.status(200).json({ message: "Account unlinked successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

exports.getAccounts = async (req, res) => {
    try {
        const userId = req.user._id;
        const accounts = await AccountModel.find({ userId });
        res.status(200).json(accounts);
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const { accountName, balance, notes, accountType } = req.body;

        const account = await AccountModel.findByIdAndUpdate(
            id,
            {
                accountName,
                balance,
                notes,
                accountType,
                lastUpdated: Date.now(),
                updatedAt: Date.now(),
            },
            { new: true }
        );

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        res.status(200).json({
            message: 'Account updated successfully',
            account,
        });
    } catch (error) {
        console.error('Error updating account:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.deleteAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const account = await AccountModel.findByIdAndDelete(id);

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        // Remove from user's accounts
        await UserModel.findByIdAndUpdate(userId, {
            $pull: { bankAccounts: id }
        });

        res.status(200).json({
            message: 'Account deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Get account health stats
exports.getAccountStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const accounts = await AccountModel.find({ userId });

        const stats = {
            totalAccounts: accounts.length,
            totalBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
            averageBalance: accounts.length > 0
                ? accounts.reduce((sum, acc) => sum + acc.balance, 0) / accounts.length
                : 0,
            accountsByType: {},
            oldestAccount: null,
            newestAccount: null,
            accountsWithMostTransactions: null,
        };

        // Group by type
        accounts.forEach(acc => {
            if (!stats.accountsByType[acc.accountType]) {
                stats.accountsByType[acc.accountType] = 0;
            }
            stats.accountsByType[acc.accountType]++;
        });

        // Find oldest and newest
        if (accounts.length > 0) {
            stats.oldestAccount = accounts.reduce((oldest, acc) =>
                new Date(acc.createdAt) < new Date(oldest.createdAt) ? acc : oldest
            );
            stats.newestAccount = accounts.reduce((newest, acc) =>
                new Date(acc.createdAt) > new Date(newest.createdAt) ? acc : newest
            );

            // Get transaction counts
            const accountsWithCounts = await Promise.all(
                accounts.map(async (acc) => {
                    const txCount = await TransactionModel.countDocuments({
                        accountId: acc._id
                    });
                    return { ...acc.toObject(), txCount };
                })
            );

            stats.accountsWithMostTransactions = accountsWithCounts.reduce((max, acc) =>
                acc.txCount > (max.txCount || 0) ? acc : max, {}
            );
        }

        res.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching account stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}