const mongoose= require('mongoose');
const accountSchema= new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    accountType: {
        type: String,
        enum: ['checking', 'savings', 'credit'],
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
    linkedbyAA:{
        type:Boolean,
        default:false
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