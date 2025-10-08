const Transaction = require('../models/TransactionModel');
const mongoose = require('mongoose');
const dayjs = require('dayjs');

exports.createTransaction = async (req, res) => {
    try {
        const { userId,bankAccountId, description, amount, type,date,note,category, tags } = req.body;
       

        const newTransaction = await Transaction.create({
            userId,
            accountId: bankAccountId,
            description,
            note,
            amount,
            type,
            date,
            category,
            tags
        });

        res.status(201).json({
            success: true,
            data: newTransaction
        });
    } catch (error) {
     
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id });
        res.status(200).json({
            success: true,
            data: transactions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({ userId: req.user.id, _id: req.params.id });
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }
        res.status(200).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


exports.updateTransaction = async (req, res) => {
    try {
        const { description, amount, type, category, note, tags, date } = req.body;
        const transaction = await Transaction.findOneAndUpdate(
            { userId: req.user.id, _id: req.params.id },
            { description, amount, type, category, note, tags, date },
            { new: true }
        );
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }
        res.status(200).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findOneAndDelete({ userId: req.user.id, _id: req.params.id });
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.filterTransactions = async (req, res) => {
    try {
        const { tags, category } = req.query;
        const filter = { userId: req.user.id };

        if (tags) {
            filter.tags = { $in: tags.split(',') };
        }

        if (category) {
            filter.category = category;
        }

        const transactions = await Transaction.find(filter);
        res.status(200).json({
            success: true,
            data: transactions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.getTransactionTrends = async (req, res) => {
    try {
        const userId = req.user.id;
        const { range = 30 } = req.query;

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - parseInt(range));

        const trends = await Transaction.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    date: { $gte: sinceDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    income: {
                        $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] }
                    },
                    expenses: {
                        $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] }
                    }
                }
            },
            {
                $project: {
                    date: "$_id",
                    income: 1,
                    expenses: 1,
                    net: { $subtract: ["$income", "$expenses"] },
                    _id: 0
                }
            },
            { $sort: { date: 1 } }
        ]);

        res.json(trends);
    } catch (error) {
        console.error("Error in getTransactionTrends:", error);
        res.status(500).json({ message: "Error fetching trends" });
    }
};



exports.getFinancialSummary = async (req, res) => {
    try {
        const userId = req.user._id; // from auth middleware

        // Get all transactions for this user
        const transactions = await Transaction.find({ userId });

        const now = dayjs();
        const currentMonth = now.format("YYYY-MM");
        const lastMonth = now.subtract(1, "month").format("YYYY-MM");

        // Helper to sum transactions by type and month
        const sumTransactions = (txs, month, type) =>
            txs
                .filter(
                    (t) =>
                        t.type.toLowerCase() === type.toLowerCase() &&
                        dayjs(t.date).format("YYYY-MM") === month)
                .reduce((acc, t) => acc + t.amount, 0);

        const currentIncome = sumTransactions(transactions, currentMonth, "income");
        const currentExpenses = sumTransactions(transactions, currentMonth, "expense");
        const currentSavings = currentIncome - currentExpenses;

        const lastIncome = sumTransactions(transactions, lastMonth, "income");
        const lastExpenses = sumTransactions(transactions, lastMonth, "expense");
        const lastSavings = lastIncome - lastExpenses;

        const percentageChange = (current, previous) => {
            if (!previous) return 0;
            return ((current - previous) / previous) * 100;
        };

        const summary = {
            totalBalance: currentSavings,
            monthlyIncome: currentIncome,
            monthlyExpenses: currentExpenses,
            monthlySavings: currentSavings > 0 ? currentSavings : 0,
            incomeChange: percentageChange(currentIncome, lastIncome),
            expensesChange: percentageChange(currentExpenses, lastExpenses),
            savingsChange: percentageChange(currentSavings, lastSavings),
        };

        return res.status(200).json({ success: true, data: summary });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
