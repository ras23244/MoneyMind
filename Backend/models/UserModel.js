const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            required: true,
            trim: true,
        },
        lastname: {
            type: String,
            required: true,
            trim: true,
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        pattern: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
    },
    password: {
        type: String,
        // required:true,
        minlength: 3,
    },
    password_otp: {
        otp: {
            type: String
        },
        send_time: {
            type: String
        },
        limit: {
            type: Number,
            default: 5
        },
        last_attempt: { type: Object }
    },
    imageUrl: {
        type: String,

    },
    bankAccounts: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Account'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});
// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


module.exports = mongoose.model('User', userSchema);