const Budget = require('../models/Budget');
const Transaction = require('../models/TransactionModel');
const mongoose = require('mongoose');
const notify = require('../utils/notify');

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

        // Compute 'spent' in bulk using aggregation to avoid N queries.
        if (!budgets || budgets.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const monthlyBudgets = budgets.filter((b) => b.durationType !== "day");
        const dayBudgets = budgets.filter((b) => b.durationType === "day");

        const monthlyMap = new Map();
        const dayMap = new Map();

        // Aggregate monthly budgets: group by category and year-month
        if (monthlyBudgets.length > 0) {
            const categories = [...new Set(monthlyBudgets.map((b) => b.category))];
            const months = [...new Set(monthlyBudgets.map((b) => b.month))];

            if (categories.length > 0 && months.length > 0) {
                const monthlyAgg = await Transaction.aggregate([
                    { $match: { userId: new mongoose.Types.ObjectId(userId), type: "expense", category: { $in: categories } } },
                    { $addFields: { monthStr: { $dateToString: { format: "%Y-%m", date: "$date" } } } },
                    { $match: { monthStr: { $in: months } } },
                    { $group: { _id: { category: "$category", month: "$monthStr" }, total: { $sum: "$amount" } } },
                ]);

                monthlyAgg.forEach((d) => {
                    monthlyMap.set(`${d._id.category}:${d._id.month}`, d.total);
                });
            }
        }

        // Aggregate daily budgets: group by category and exact day
        if (dayBudgets.length > 0) {
            const categories = [...new Set(dayBudgets.map((b) => b.category))];
            const days = [...new Set(dayBudgets.map((b) => b.day))];

            if (categories.length > 0 && days.length > 0) {
                const dayAgg = await Transaction.aggregate([
                    { $match: { userId: new mongoose.Types.ObjectId(userId), type: "expense", category: { $in: categories } } },
                    { $addFields: { dayStr: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } } },
                    { $match: { dayStr: { $in: days } } },
                    { $group: { _id: { category: "$category", day: "$dayStr" }, total: { $sum: "$amount" } } },
                ]);

                dayAgg.forEach((d) => {
                    dayMap.set(`${d._id.category}:${d._id.day}`, d.total);
                });
            }
        }

        const budgetsWithSpent = budgets.map((b) => {
            const key = b.durationType === "day" ? `${b.category}:${b.day}` : `${b.category}:${b.month}`;
            const value = b.durationType === "day" ? dayMap.get(key) : monthlyMap.get(key);
            b.spent = value || b.spent || 0;
            return b;
        });

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
        await notify({
            userId: req.user.id,
            type: 'budget_created',
            title: 'New budget created',
            body: `Budget for ${category} set to ${amount}`,
            data: { budgetId: budget._id.toString(), category },
            priority: 'low'
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
       

        if (!budget) {
            return res.status(404).json({ success: false, error: "Budget not found" });
        }
        await notify({
            userId: req.user.id,
            type: 'budget_updated',
            title: 'Budget updated',
            body: `Budget for ${category || budget.category} updated to ${amount || budget.amount}`,
            data: { budgetId: budget._id.toString() },
            priority: 'low'
        });
        // Return the updated budget so the frontend mutation receives fresh data
        return res.json({ success: true, data: budget });

    } catch (err) {
        console.error("Error updating budget:", err);
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