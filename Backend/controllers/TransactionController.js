const Transaction = require('../models/TransactionModel');
const Account = require('../models/AccountModel');
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const notify = require('../utils/notify');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.createTransaction = async (req, res) => {
    try {
        const {
            bankAccountId,
            description,
            amount,
            type,
            date,
            note,
            category,
            tags,
        } = req.body;

        const userId = req.user.id;

        const amtNum = Number(amount);

        const transaction = await Transaction.create({
            userId,
            accountId: bankAccountId || null,
            description,
            note,
            amount: amtNum,
            type,
            category,
            tags,
            date: date || new Date(),
            source: bankAccountId ? 'automatic' : 'manual',
        });

        // Update bank balance only if linked to account
        if (bankAccountId) {
            const balanceChange = type === 'income' ? amtNum : -amtNum;

            await Account.findByIdAndUpdate(
                bankAccountId,
                { $inc: { balance: balanceChange } }
            );
        }

        // Notification logic
        if (type === 'income' && amtNum > 1000) {
            await notify({
                userId,
                type: 'transaction_income',
                title: 'Large deposit received',
                body: `Received ${amtNum} from ${description}`,
                data: { transactionId: transaction._id.toString() },
                priority: 'medium',
            });
        }

        res.status(201).json({
            success: true,
            data: transaction,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};


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
            message: 'Internal Server Error'
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
            message: 'Internal Server Error'
        });
    }
};

exports.updateTransaction = async (req, res) => {
    try {
        const { description, amount, type, category, note, tags, date, bankAccountId } = req.body;

        const originalTransaction = await Transaction.findOne({ userId: req.user.id, _id: req.params.id });
        if (!originalTransaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        const updateFields = {};
        if (typeof description !== 'undefined') updateFields.description = description;
        if (typeof category !== 'undefined') updateFields.category = category;
        if (typeof note !== 'undefined') updateFields.note = note;
        if (typeof tags !== 'undefined') updateFields.tags = tags;
        if (typeof type !== 'undefined') updateFields.type = type;
        if (typeof bankAccountId !== 'undefined') updateFields.accountId = bankAccountId;

        let newAmount = originalTransaction.amount;
        if (typeof amount !== 'undefined') {
            const amtNum = Number(amount);
            if (isNaN(amtNum)) {
                return res.status(400).json({ success: false, error: 'Invalid amount' });
            }
            updateFields.amount = amtNum;
            newAmount = amtNum;
        }

        // Validate and normalize date if provided
        if (typeof date !== 'undefined') {
            if (date === null || date === '') {
                updateFields.date = null;
            } else {
                let dateInput = date;

                if (typeof date === 'string' && date.includes('T')) {
                    dateInput = date.split('T')[0]; // "2026-01-30"
                }

                let parsed = dayjs(dateInput);

                if (!parsed.isValid()) {
                    if (typeof date === 'object') {
                        if (date.$date) parsed = dayjs(date.$date);
                        else if (typeof date.toISOString === 'function') parsed = dayjs(date.toISOString());
                    }
                    if (!parsed.isValid()) {
                        const native = new Date(date);
                        if (!isNaN(native.getTime())) parsed = dayjs(native);
                    }
                }

                if (!parsed.isValid()) {
                    return res.status(400).json({ success: false, error: 'Invalid date format' });
                }
                updateFields.date = parsed.toDate();
            }
        }

        const transaction = await Transaction.findOneAndUpdate(
            { userId: req.user.id, _id: req.params.id },
            updateFields,
            { new: true }
        );

        // Update account balance if amount or type changed, or if account changed
        const newType = type || originalTransaction.type;
        const newAccountId = bankAccountId || originalTransaction.accountId;

        // If the account ID changed, handle the old and new account balances
        if (bankAccountId && bankAccountId !== originalTransaction.accountId) {
            // Reverse effect from old account
            if (originalTransaction.accountId) {
                const reverseChange = originalTransaction.type === 'income' ? -originalTransaction.amount : originalTransaction.amount;
                await Account.findByIdAndUpdate(
                    originalTransaction.accountId,
                    { $inc: { balance: reverseChange } },
                    { new: true }
                );
            }

            // Apply effect to new account
            if (newAccountId) {
                const newChange = newType === 'income' ? newAmount : -newAmount;
                await Account.findByIdAndUpdate(
                    newAccountId,
                    { $inc: { balance: newChange } },
                    { new: true }
                );
            }

            // Update the accountId in the transaction
            updateFields.accountId = newAccountId;
        }
        // If amount or type changed (but same account)
        else if (newAccountId && (newAmount !== originalTransaction.amount || newType !== originalTransaction.type)) {
            // Check if account exists
            const account = await Account.findById(newAccountId);
            if (account) {
                // Reverse the original transaction's effect
                const reverseChange = originalTransaction.type === 'income' ? -originalTransaction.amount : originalTransaction.amount;

                // Apply the new transaction's effect
                const newChange = newType === 'income' ? newAmount : -newAmount;

                const totalChange = reverseChange + newChange;

                await Account.findByIdAndUpdate(
                    newAccountId,
                    { $inc: { balance: totalChange } },
                    { new: true }
                );
            }
        }

        // Re-fetch the transaction with updated fields
        const updatedTransaction = await Transaction.findOneAndUpdate(
            { userId: req.user.id, _id: req.params.id },
            updateFields,
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: updatedTransaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
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

        // Revert account balance when transaction is deleted
        if (transaction.accountId) {
            const balanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount;
            await Account.findByIdAndUpdate(
                transaction.accountId,
                { $inc: { balance: balanceChange } },
                { new: true }
            );
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
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
            message: 'Internal Server Error'
        });
    }
};

exports.exportTransactions = async (req, res) => {
    try {
        const { startDate, endDate, category, tags, type, minAmount, maxAmount, search } = req.query;
        const filter = { userId: req.user.id };

        if (startDate || endDate) {
            const s = startDate ? new Date(startDate) : new Date('1970-01-01');
            const e = endDate ? new Date(endDate) : new Date();
            filter.date = { $gte: s, $lte: e };
        }

        if (category) filter.category = category;
        if (type) filter.type = type;
        if (tags) filter.tags = { $in: tags.split(',') };

        const amountFilter = {};
        if (minAmount) amountFilter.$gte = Number(minAmount);
        if (maxAmount) amountFilter.$lte = Number(maxAmount);
        if (Object.keys(amountFilter).length) filter.amount = amountFilter;

        if (search) {
            const re = new RegExp(search, 'i');
            filter.$or = [
                { description: re },
                { note: re },
                { category: re },
            ];
        }

        const transactions = await Transaction.find(filter).lean().limit(20000);


        const headers = ['date', 'description', 'amount', 'type', 'category'];

        const escape = (val) => {
            if (val === null || typeof val === 'undefined') return '';
            let s = String(val);
            s = s.replace(/\"/g, '""');
            if (s.indexOf(',') >= 0 || s.indexOf('"') >= 0 || s.indexOf('\n') >= 0) {
                return '"' + s + '"';
            }
            return s;
        };

        const rows = transactions.map((t) => {
            return headers.map((h) => {
                if (h === 'date' && t.date) return escape(new Date(t.date).toISOString());
                if (h === 'tags') return escape((t.tags || []).join(';'));
                if (t[h] === undefined) return '';
                return escape(t[h]);
            }).join(',');
        });

        const csv = [headers.join(','), ...rows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getTransactionTrends = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate, granularity = 'day', page = 1, limit = 100, range } = req.query;

        if (!userId) return res.status(400).json({ message: 'userId is required' });

        let start;
        let end;

        if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
        } else if (range) {
            const days = parseInt(range, 10) || 30;
            end = new Date();
            start = new Date();
            start.setDate(start.getDate() - days);
        } else {
            // default last 30 days
            end = new Date();
            start = new Date();
            start.setDate(start.getDate() - 30);
        }

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 1000), 2000);

        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Choose grouping expression based on granularity
        let groupIdExpr;
        let projectDateExpr;

        switch (granularity) {
            case 'month':
                groupIdExpr = { $dateToString: { format: '%Y-%m', date: '$date' } };
                projectDateExpr = { $dateToString: { format: '%Y-%m', date: '$date' } };
                break;
            case 'week':
                // Use dateTrunc to week if available; fall back to day grouping if not
                groupIdExpr = { $dateTrunc: { date: '$date', unit: 'week' } };
                projectDateExpr = { $dateToString: { format: '%Y-%m-%d', date: '$$ROOT._id' } };
                break;
            case 'day':
            default:
                groupIdExpr = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
                projectDateExpr = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
        }

        const matchStage = {
            $match: {
                userId: userObjectId,
                date: { $gte: start, $lte: end },
            },
        };

        const pipeline = [matchStage];

        // Grouping
        pipeline.push({
            $group: {
                _id: groupIdExpr,
                income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
                expenses: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
            },
        });

        // Project fields and compute net
        if (granularity === 'week') {
            pipeline.push({
                $project: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$_id' } },
                    income: 1,
                    expenses: 1,
                    net: { $subtract: ['$income', '$expenses'] },
                    _id: 0,
                },
            });
        } else {
            pipeline.push({
                $project: {
                    date: '$_id',
                    income: 1,
                    expenses: 1,
                    net: { $subtract: ['$income', '$expenses'] },
                    _id: 0,
                },
            });
        }

        pipeline.push({ $sort: { date: 1 } });

        // Pagination of result buckets
        pipeline.push({
            $facet: {
                metadata: [{ $count: 'total' }],
                data: [{ $skip: (pageNum - 1) * limitNum }, { $limit: limitNum }],
            },
        });

        const result = await Transaction.aggregate(pipeline);

        const metadata = result[0]?.metadata[0] || { total: 0 };
        const data = result[0]?.data || [];

        res.json({ success: true, data, pagination: { total: metadata.total || 0, page: pageNum, limit: limitNum, pages: Math.ceil((metadata.total || 0) / limitNum) } });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching trends' });
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
        res.status(500).json({ success: false, message: 'Internal Server Error' });
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
        res.status(500).json({ success: false, message: 'Internal Server Error' });
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
        res.status(500).json({ success: false, message: 'Internal Server Error' });
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
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getForecast = async (req, res) => {
    try {
        const userObjectId = new mongoose.Types.ObjectId(req.user.id);
        const months = parseInt(req.query.months, 10) || 3;
        const lookback = parseInt(req.query.lookback, 10) || 6;

        const startDate = dayjs()
            .subtract(lookback - 1, 'month')
            .startOf('month')
            .toDate();

        const monthlyData = await Transaction.aggregate([
            {
                $match: {
                    userId: userObjectId,
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m",
                            date: "$date"
                        }
                    },
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
                    month: "$_id",
                    net: { $subtract: ["$income", { $abs: "$expenses" }] },
                    _id: 0
                }
            },
            { $sort: { month: 1 } }
        ]);


        const nets = monthlyData.map((m) => m.net || 0);
        const avgNet = nets.length ? Math.round(nets.reduce((a, b) => a + b, 0) / nets.length) : 0;

        const forecast = [];
        for (let i = 1; i <= months; i++) {
            const monthKey = dayjs().add(i, 'month').format('YYYY-MM');
            forecast.push({ month: monthKey, projectedNet: avgNet });
        }

        res.status(200).json({ success: true, data: { history: monthlyData, forecast } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
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
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


exports.getAccountTransactions = async (req, res) => {
    try {
        const { accountId } = req.params;
        const userId = req.user.id;

        const transactions = await Transaction.find({ userId, accountId });
        res.status(200).json({ success: true, data: transactions });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

exports.bulkCreateTransactions = async (req, res) => {
    try {
        const { transactions } = req.body;

        if (!Array.isArray(transactions) || transactions.length === 0) {
            return res.status(400).json({ success: false, message: 'transactions array is required' });
        }

        const docs = transactions.map((t) => {
            // Validate/normalize date; fall back to current date when invalid
            let date;
            if (typeof t.date !== 'undefined' && t.date !== null && t.date !== '') {
                const parsed = dayjs(t.date);
                date = parsed.isValid() ? parsed.toDate() : new Date();
            } else {
                date = new Date();
            }

            return {
                userId: req.user.id,
                accountId: t.bankAccountId || t.accountId || null,
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
                message: 'Partial success'
            });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

exports.structureReceipt = async (req, res) => {
    try {
        const { text } = req.body;

        // UPDATED: Use gemini-2.5-flash and explicit v1beta
        const model = genAI.getGenerativeModel(
            { model: "gemini-2.5-flash" },
            { apiVersion: "v1beta" }
        );

        const generationConfig = {
            responseMimeType: "application/json",
            responseSchema: {
                type: "object",
                properties: {
                    transactions: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                description: { type: "string" },
                                amount: { type: "number" },
                                merchant: { type: "string" },
                                type: { type: "string", enum: ["expense", "income"] },
                                category: { type: "string" },
                                date: { type: "string" },
                                note: { type: "string" }
                            },
                            required: ["description", "amount", "type", "category"]
                        }
                    }
                }
            }
        };

        const prompt = `Convert this messy receipt text into structured transactions. 
        Categorize items logically (e.g., electronics, food, tools). 
        Text: ${text}`;

        // Pass the config during content generation
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig
        });

        const responseText = result.response.text();
        const parsedData = JSON.parse(responseText);

        res.status(200).json(parsedData.transactions);
    } catch (error) {
        res.status(500).json({ error: "AI Parsing failed", details: "Internal Server Error" });
    }
};
