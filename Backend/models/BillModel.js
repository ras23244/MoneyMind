const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    frequency: {
        type: String,
        enum: ['one-time', 'daily', 'weekly', 'monthly', 'yearly'],
        default: 'monthly'
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'overdue'],
        default: 'pending'
    },
    autopay: {
        enabled: {
            type: Boolean,
            default: false
        },
        accountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account'
        }
    },
    reminderDays: {
        type: Number,
        default: 3 // Remind 3 days before due date
    },
    notes: String,
    recurring: {
        type: Boolean,
        default: true
    },
    lastPaidDate: Date,
    nextDueDate: Date,
    paymentHistory: [{
        date: Date,
        amount: Number,
        status: String,
        transactionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transaction'
        }
    }]
}, {
    timestamps: true
});

// Add index for efficient queries
billSchema.index({ userId: 1, dueDate: 1 });
billSchema.index({ userId: 1, status: 1 });

// Pre-save middleware to set nextDueDate
billSchema.pre('save', function (next) {
    if (!this.nextDueDate) {
        this.nextDueDate = this.dueDate;
    }
    next();
});

module.exports = mongoose.model('Bill', billSchema);
