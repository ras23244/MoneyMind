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
        required: true,
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
    notes: {
        type: String,
        default: '',
    },
    linkedbyAA: {
        type: Boolean,
        default: false
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
    // consentId:{
    //     type:String,
    //     required:true
    // },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Account', accountSchema);