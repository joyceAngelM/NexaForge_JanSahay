const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    mobileNumber: { type: String, required: true, unique: true },
    otp: String,
    otpExpiry: Date,
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);