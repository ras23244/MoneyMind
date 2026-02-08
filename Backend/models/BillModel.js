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
  
    frequency: {
        type: String,
        enum: ['one-time', 'daily', 'weekly', 'monthly', 'yearly'],
        default: 'monthly'
    },
    status: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
    reminderDays: {
        type: Number,
        default: 3 // Remind 3 days before due date
    },
    recurring: {
        type: Boolean,
        default: true
    },
    nextDueDate: Date,
}, {
    timestamps: true
});

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
