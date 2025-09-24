const mongoose = require('mongoose');
//this will be used to set up hte budget of a particlular category
const budgetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        default: 0,
    },
    spent: {
        type: Number,
        required: true,
    },
    month: { type: String, required: true },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Budget', budgetSchema);
