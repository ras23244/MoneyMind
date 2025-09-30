const Budget = require('../models/Budget');
const Transaction = require('../models/TransactionModel');

exports.getBudgets = async (req, res) => {
    try {
        // Fetch all budgets for the user, ignore month filter
        const budgets = await Budget.find({ userId: req.user.id });

        // Calculate spent for each budget
        const budgetsWithSpent = await Promise.all(budgets.map(async (b) => {
            if (!b.spent) {
                // Match transactions according to daily/monthly budget
                const match = {
                    userId: req.user.id,
                    type: "expense",
                    category: b.category,
                };

                if (b.durationType === "daily") {
                    match.date = b.date; // exact day
                } else if (b.durationType === "monthly") {
                    match.date = {
                        $gte: new Date(`${b.month}-01`),
                        $lt: new Date(`${b.month}-31`),
                    };
                }

                const spent = await Transaction.aggregate([
                    { $match: match },
                    { $group: { _id: null, total: { $sum: "$amount" } } },
                ]);

                b.spent = spent[0]?.total || 0;
            }
            return b;
        }));

        res.json({ success: true, data: budgetsWithSpent });
    } catch (err) {
        console.log("err", err);
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