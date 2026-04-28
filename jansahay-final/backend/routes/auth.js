const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

router.post('/send-otp', async (req, res) => {
    try {
        const { mobileNumber } = req.body;
        
        let user = await User.findOne({ mobileNumber });
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60000);
        
        if (!user) {
            user = new User({ mobileNumber, otp, otpExpiry });
        } else {
            user.otp = otp;
            user.otpExpiry = otpExpiry;
        }
        
        await user.save();
        console.log(`📱 OTP for ${mobileNumber}: ${otp}`);
        
        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/verify-otp', async (req, res) => {
    try {
        const { mobileNumber, otp } = req.body;
        const user = await User.findOne({ mobileNumber });
        
        if (!user || user.otp !== otp || user.otpExpiry < new Date()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }
        
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();
        
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, message: 'Verified successfully', token });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;