const Budget = require('../models/Budget');
const Transaction = require('../models/TransactionModel');

exports.getBudgets = async (req, res) => {
    try {
        const { category, month, duration, durationType, search, minAmount, maxAmount } = req.query;
        const userId = req.user.id;

        let filter = { userId };

        // Category filter
        if (category) filter.category = category;

        // Month filter (e.g. "2025-09")
        if (month) filter.month = month;

        // Duration filter (e.g. "1", "3", "6" months)
        if (duration) {
            const months = parseInt(duration, 10);
            const cutoff = new Date();
            cutoff.setMonth(cutoff.getMonth() - months);
            filter.createdAt = { $gte: cutoff };
        }

        // Duration Type filter ("month" or "day")
        if (durationType) filter.durationType = durationType;

        // Amount range filter
        if (minAmount || maxAmount) {
            filter.amount = {};
            if (minAmount) filter.amount.$gte = Number(minAmount);
            if (maxAmount) filter.amount.$lte = Number(maxAmount);
        }

        // Search filter (case-insensitive search on category)
        if (search) {
            filter.category = { $regex: new RegExp(search, "i") };
        }

        // Fetch budgets
        const budgets = await Budget.find(filter).sort({ createdAt: -1 });

        // Compute 'spent' dynamically if not stored
        const budgetsWithSpent = await Promise.all(
            budgets.map(async (b) => {
                const match = {
                    userId,
                    type: "expense",
                    category: b.category,
                };

                if (b.durationType === "day") {
                    const day = new Date(b.day);
                    match.date = {
                        $gte: new Date(day.setHours(0, 0, 0)),
                        $lt: new Date(day.setHours(23, 59, 59)),
                    };
                } else {
                    const monthStart = new Date(`${b.month}-01`);
                    match.date = {
                        $gte: monthStart,
                        $lt: new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1),
                    };
                }

                const spent = await Transaction.aggregate([
                    { $match: match },
                    { $group: { _id: null, total: { $sum: "$amount" } } },
                ]);

                b.spent = spent[0]?.total || b.spent || 0;
                return b;
            })
        );

        res.json({ success: true, data: budgetsWithSpent });
    } catch (err) {
        console.error("Error fetching budgets:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};



exports.createBudget = async (req, res) => {
    try {
        const { category, amount, spent, month, duration, durationType, day } = req.body;
        if (duration && duration > 12 && durationType !== "day") {
            return res.status(400).json({ success: false, error: "Budgets beyond 12 months are not allowed." });
        }
        const budget = await Budget.create({
            userId: req.user.id,
            category,
            amount,
            spent: spent || 0,
            month,
            duration: duration || 1,
            durationType: durationType || "month", // "month" or "day"
            day: durationType === "day" ? day : undefined,
        });
        res.status(201).json({ success: true, data: budget });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateBudget = async (req, res) => {
    try {
        const { category, amount, spent, month, duration, durationType, day } = req.body;
        if (duration && duration > 12 && durationType !== "day") {
            return res.status(400).json({ success: false, error: "Budgets beyond 12 months are not allowed." });
        }
        const budget = await Budget.findOneAndUpdate(
            { userId: req.user.id, _id: req.params.id },
            { category, amount, spent, month, duration, durationType, day: durationType === "day" ? day : undefined },
            { new: true }
        );
        res.json({ success: true, data: budget });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteBudget = async (req, res) => {
    try {
        await Budget.findOneAndDelete({ userId: req.user.id, _id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};