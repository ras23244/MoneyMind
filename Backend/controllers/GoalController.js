const express = require('express');
const Goal = require('../models/Goal');
const mongoose = require('mongoose');
const { validationResult } = require("express-validator");

exports.getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user.id });
        console.log("goals from backend",goals)
        res.status(200).json({ success: true, data: goals });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
        console.error(err);
    }
}

exports.createGoal = async (req, res) => {
    try {
        const { title, description, targetAmount, currentAmount, startDate, endDate, priority } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        if (!title || !targetAmount || !startDate || !endDate) {
            return res.status(400).json({ success: false, error: "Please provide all required fields" });
        }
        if (targetAmount <= 0) {
            return res.status(400).json({ success: false, error: "Target amount must be greater than zero" });
        }
        if (currentAmount && currentAmount < 0) {
            return res.status(400).json({ success: false, error: "Current amount cannot be negative" });
        }
        if (currentAmount && currentAmount > targetAmount) {
            return res.status(400).json({ success: false, error: "Current amount cannot exceed target amount" });
        }
        if (startDate >= endDate) {
            return res.status(400).json({ success: false, error: "End date must be after start date" });
        }
        const newGoal = new Goal({
            userId: req.user.id,
            title,
            description: description || '',
            targetAmount,
            currentAmount: currentAmount || 0,
            startDate,
            endDate,
            priority: priority || 1,
        });
        console.log("goal from backend",newGoal)
        await newGoal.save();
        res.status(201).json({ success: true, data: newGoal });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: err.message });
        
    }
}


exports.updateGoal = async (req, res) => {
    try {
        const {id } = req.params;
        const updates = req.body;
     
        const goal = await Goal.findOneAndUpdate(
            { _id: id, userId: req.user.id },
            updates,
            { new: true, runValidators: true }
        );

        if (!goal) {
            return res.status(404).json({ success: false, error: "Goal not found" });
        }

        res.status(200).json({ success: true, data: goal });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
        console.error(err);
    }
};


exports.deleteGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const goal = await Goal.findOneAndDelete({ _id: id, userId: req.user.id });

        if (!goal) {
            return res.status(404).json({ success: false, error: "Goal not found" });
        }

        res.status(200).json({ success: true, message: "Goal deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
        console.error(err);
    }
};
