const Budget = require('../models/Budget');
const Transaction = require('../models/TransactionModel');

exports.getBudgets = async (req, res) => {
    try {
        const { month } = req.query;
        const budgets = await Budget.find({ userId: req.user.id, month });
        // For each budget, auto-calculate spent if not set
        const budgetsWithSpent = await Promise.all(budgets.map(async (b) => {
            if (b.spent === 0) {
                const spent = await Transaction.aggregate([
                    {
                        $match: {
                            userId: req.user.id,
                            category: b.category,
                            type: "expense",
                            date: {
                                $gte: new Date(`${month}-01`),
                                $lt: new Date(`${month}-31`)
                            }
                        }
                    },
                    { $group: { _id: null, total: { $sum: "$amount" } } }
                ]);
                b.spent = spent[0]?.total || 0;
            }
            return b;
        }));
        res.json({ success: true, data: budgetsWithSpent });
    } catch (err) {
        console.log("err",err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.createBudget = async (req, res) => {
    try {
        const { category, amount, spent, month } = req.body;
        const budget = await Budget.create({
            userId: req.user.id,
            category,
            amount,
            spent: spent || 0,
            month,
        });
        res.status(201).json({ success: true, data: budget });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateBudget = async (req, res) => {
    try {
        const { category, amount, spent, month } = req.body;
        const budget = await Budget.findOneAndUpdate(
            { userId: req.user.id, _id: req.params.id },
            { category, amount, spent, month },
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