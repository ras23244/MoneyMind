const express = require('express');
const Transaction = require('../models/TransactionModel');

exports.createTransaction = async (req, res) => {
    try {
        const { userId,bankAccountId, description, amount, type,date, category, tags } = req.body;
        console.log("Creating transaction with data:", req.body);

        const newTransaction = await Transaction.create({
            userId,
            accountId: bankAccountId,
            description,
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
        console.log("Error creating transaction:", error);
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
        const { description, amount, type, category, tags, date } = req.body;
        const transaction = await Transaction.findOneAndUpdate(
            { userId: req.user.id, _id: req.params.id },
            { description, amount, type, category, tags },
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