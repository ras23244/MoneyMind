const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
   
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
    },

    description: {
        type: String,
        trim: true,
        required: [true, 'Please add a description'],
    },

    amount: {
        type: Number,
        required: [true, 'Please add a positive or negative number'],
    },

    type: {
        type: String,
        enum: ['income', 'expense'],
        required: true,
    },

    category: {
        type: String,
        required: true,
    },

  
    tags: [String],

    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Transaction', transactionSchema);