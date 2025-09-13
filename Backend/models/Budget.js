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
    amountLimit: {
        type: Number,
        required: true,
    },
    month:{
        type:Number
    },
    year:{
        type:Number
    },
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
