const mongoose = require('mongoose');
const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    accountType: {
        type: String,
        enum: ['checking', 'savings', 'credit', 'wallet', 'investment'],
        default: 'checking'
    },
    accountName: {
        type: String,
    },
    accountNumber: {
        type: String,
        required: true,
        unique: true,
    },
    bankName: {
        type: String,
        required: true,
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
    },
    previousBalance: {
        type: Number,
        default: 0,
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    
});

module.exports = mongoose.model('Account', accountSchema);