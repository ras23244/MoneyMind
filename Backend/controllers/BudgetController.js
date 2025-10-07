const Budget = require('../models/Budget');
const Transaction = require('../models/TransactionModel');

exports.getBudgets = async (req, res) => {
    try {
        const { duration, month, durationType } = req.query;
        const userId = req.user.id;
        let filter = { userId: userId };

        // Handle month filter
        if (month) {
            filter.month = month;
        }

        // Handle duration filter
        if (duration) {
            const months = parseInt(duration, 10);
            const cutoff = new Date();
            cutoff.setMonth(cutoff.getMonth() - months);
            filter.createdAt = { $gte: cutoff };
        }

        // Handle duration type filter
        if (durationType) {
            filter.durationType = durationType;
        }

        // Fetch budgets based on applied filters
        const budgets = await Budget.find(filter);

        // Calculate spent for each budget
        const budgetsWithSpent = await Promise.all(
            budgets.map(async (b) => {
                if (!b.spent) {
                    const match = {
                        userId: userId,
                        type: "expense",
                        category: b.category,
                    };

                    // Set date range for transactions based on budget type
                    if (b.durationType === "daily") {
                        const budgetDay = new Date(b.day);
                        match.date = {
                            $gte: new Date(budgetDay.setHours(0, 0, 0)),
                            $lt: new Date(budgetDay.setHours(23, 59, 59)),
                        };
                    } else { // 'monthly'
                        const budgetMonth = new Date(`${b.month}-01`);
                        match.date = {
                            $gte: budgetMonth,
                            $lt: new Date(budgetMonth.getFullYear(), budgetMonth.getMonth() + 1, 1),
                        };
                    }

                    const spent = await Transaction.aggregate([
                        { $match: match },
                        { $group: { _id: null, total: { $sum: "$amount" } } },
                    ]);
                    b.spent = spent[0]?.total || 0;
                }
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