const Transaction = require('../models/TransactionModel');
const mongoose = require('mongoose');
const dayjs = require('dayjs');

exports.createTransaction = async (req, res) => {
    try {
        const { userId, bankAccountId, description, amount, type, date, note, category, tags } = req.body;
        console.log("Creating transaction:", { userId, bankAccountId, description, amount, type, date, note, category, tags });


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



exports.getCategoryBreakdown = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const { period = 'month' } = req.query;

        let dateFilter = {};
        const now = dayjs();

        switch (period) {
            case 'quarter':
                dateFilter = { $gte: now.subtract(3, 'month').format('YYYY-MM-DD') };
                break;
            case 'year':
                dateFilter = { $gte: now.subtract(1, 'year').format('YYYY-MM-DD') };
                break;
            default: // month
                dateFilter = { $regex: `^${now.format('YYYY-MM')}` };
        }

        const categories = await Transaction.aggregate([
            {
                $match: {
                    userId,
                    date: dateFilter,
                    type: 'expense'
                }
            },
            {
                $group: {
                    _id: '$category',
                    value: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    name: { $ifNull: ['$_id', 'Other'] },
                    value: { $abs: '$value' },
                    count: 1,
                    _id: 0
                }
            },
            { $sort: { value: -1 } },
            { $limit: 6 }
        ]);

        res.status(200).json({ success: true, data: categories });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getCategoryAggregation = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const { range, start, end } = req.query;

        let startDate;
        let endDate = dayjs().endOf('day');


        switch (range) {
            case '3M':
                startDate = dayjs().startOf('month').subtract(2, 'month');
                break;
            case '6M':
                startDate = dayjs().startOf('month').subtract(5, 'month');
                break;
            case '1M':
            default:
                startDate = dayjs().startOf('month');
        }


        const s = startDate.startOf('day').toDate();
        const e = endDate.endOf('day').toDate();

        // Aggregate overall category totals in range (using Date types)
        const overall = await Transaction.aggregate([
            { $match: { userId, date: { $gte: s, $lte: e }, type: 'expense' } },
            { $group: { _id: { $ifNull: ['$category', 'Other'] }, total: { $sum: '$amount' } } },
            { $project: { name: '$_id', value: { $abs: '$total' }, _id: 0 } },
            { $sort: { value: -1 } }
        ]);

        // Aggregate month-category totals to compute month-wise top category
        const monthCat = await Transaction.aggregate([
            { $match: { userId, date: { $gte: s, $lte: e }, type: 'expense' } },
            { $project: { month: { $dateToString: { format: '%Y-%m', date: '$date' } }, category: { $ifNull: ['$category', 'Other'] }, amount: { $abs: '$amount' } } },
            { $group: { _id: { month: '$month', category: '$category' }, total: { $sum: '$amount' } } },
            { $project: { month: '$_id.month', category: '$_id.category', total: 1, _id: 0 } },
            { $sort: { month: 1, total: -1 } }
        ]);

        // Build month-wise top
        const monthMap = {};
        monthCat.forEach((r) => {
            if (!monthMap[r.month]) monthMap[r.month] = [];
            monthMap[r.month].push({ name: r.category, value: r.total });
        });

        const months = Object.keys(monthMap).sort();
        const monthwise = months.map((m) => ({ month: m, top: monthMap[m][0] || { name: '—', value: 0 }, all: monthMap[m] }));

        res.status(200).json({ success: true, data: { overall, monthwise } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getSpendingHeatmap = async (req, res) => {

    try {

        const userId = new mongoose.Types.ObjectId(req.user.id);
        const startDate = dayjs().subtract(27, 'days').startOf('day').toDate();

        const dailySpending = await Transaction.aggregate([
            {
                $match: {
                    userId,
                    date: { $gte: startDate },
                    type: 'expense'
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    total: { $sum: '$amount' }
                }
            },
            {
                $project: {
                    date: '$_id',
                    total: { $abs: '$total' },
                    _id: 0
                }
            },
            { $sort: { date: 1 } }
        ]);

        const heatmapData = Array(4).fill().map(() => Array(7).fill(0));
        dailySpending.forEach(day => {
            const date = dayjs(day.date);
            const daysSince = dayjs().diff(date, 'day');
            if (daysSince >= 0 && daysSince < 28) {
                const week = Math.floor(daysSince / 7);
                const dayOfWeek = date.day();
                heatmapData[week][dayOfWeek] = Math.round(day.total);
            }
        });

        res.status(200).json({ success: true, data: heatmapData });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getTrendData = async (req, res) => {
    try {
        const userId = req.user.id;
        const startDate = dayjs().subtract(5, 'months').startOf('month').format('YYYY-MM-DD');

        const monthlyData = await Transaction.aggregate([
            {
                $match: {
                    userId,
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $substr: ['$date', 0, 7] },
                    income: {
                        $sum: {
                            $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
                        }
                    },
                    expenses: {
                        $sum: {
                            $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
                        }
                    }
                }
            },
            {
                $project: {
                    month: '$_id',
                    income: 1,
                    expenses: { $abs: '$expenses' },
                    _id: 0
                }
            },
            { $sort: { month: 1 } }
        ]);

        // Ensure we have data for all 6 months
        const trends = [];
        for (let i = 5; i >= 0; i--) {
            const monthKey = dayjs().subtract(i, 'month').format('YYYY-MM');
            const monthData = monthlyData.find(m => m.month === monthKey) || { income: 0, expenses: 0 };
            trends.push({
                month: dayjs(monthKey).format('MMM'),
                income: Math.round(monthData.income),
                expenses: Math.round(monthData.expenses)
            });
        }

        res.status(200).json({ success: true, data: trends });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getFinancialSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = dayjs();
        const currentMonth = now.format("YYYY-MM");
        const lastMonth = now.subtract(1, "month").format("YYYY-MM");

        // Get all transactions for the current and last month
        const transactions = await Transaction.find({
            userId,
            date: {
                $gte: now.subtract(1, "month").startOf("month").format("YYYY-MM-DD"),
                $lte: now.endOf("month").format("YYYY-MM-DD")
            }
        });

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


exports.getAccountTransactions = async (req, res) => {
    try {
        const { accountId } = req.params;
        const userId = req.user.id;

        const transactions = await Transaction.find({ userId, accountId });
        res.status(200).json({ success: true, data: transactions });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

exports.bulkCreateTransactions = async (req, res) => {
    try {
        const { transactions } = req.body;

        if (!Array.isArray(transactions) || transactions.length === 0) {
            return res.status(400).json({ success: false, message: 'transactions array is required' });
        }

        const docs = transactions.map((t) => {
            const date = t.date ? new Date(t.date) : new Date();
            return {
                userId: req.user.id,
                accountId: t.bankAccountId || t.accountId || t.accountId || null,
                description: t.description || '',
                note: t.note || '',
                amount: Number(t.amount) || 0,
                merchant: t.merchant || '',
                type: (t.type || 'expense').toLowerCase().startsWith('inc') ? 'income' : 'expense',
                category: t.category || 'Uncategorized',
                source: t.source || 'manual',
                tags: Array.isArray(t.tags) ? t.tags : (t.tags ? [t.tags] : []),
                date,
            };
        });

        try {
            const inserted = await Transaction.insertMany(docs, { ordered: false });
            return res.status(201).json({ success: true, inserted: inserted.length, data: inserted });
        } catch (bulkErr) {
            const inserted = bulkErr.insertedDocs || bulkErr.result?.getInsertedIds?.() || [];
            const insertedCount = Array.isArray(inserted) ? inserted.length : 0;
            return res.status(207).json({
                success: true,
                inserted: insertedCount,
                attempted: docs.length,
                message: 'Partial success',
                error: bulkErr.message,
            });
        }
    } catch (error) {
        console.error('bulkCreateTransactions error', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}