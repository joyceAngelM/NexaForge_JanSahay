const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');

const defaultSchemes = [
    { name: "Ayushman Bharat PM-JAY", category: "health", benefits: ["Free health cover up to ₹5 lakhs"], documents: ["Aadhaar", "Ration card"], aiVerified: true },
    { name: "Pradhan Mantri Awas Yojana", category: "housing", benefits: ["Subsidy on home loans"], documents: ["Aadhaar", "Income certificate"], aiVerified: true },
    { name: "Sukanya Samriddhi Yojana", category: "women", benefits: ["Higher interest rate"], documents: ["Girl child birth certificate"], aiVerified: true },
    { name: "Pradhan Mantri Mudra Yojana", category: "business", benefits: ["Loans up to ₹10 lakhs"], documents: ["Business plan"], aiVerified: true },
    { name: "PM-KISAN", category: "farmer", benefits: ["₹6000 per year"], documents: ["Land records"], aiVerified: true }
];

router.get('/', async (req, res) => {
    try {
        let schemes = await Scheme.find();
        if (schemes.length === 0) {
            schemes = defaultSchemes;
        }
        res.json({ success: true, schemes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, schemes: defaultSchemes });
    }
});

router.post('/', async (req, res) => {
    try {
        const scheme = new Scheme(req.body);
        await scheme.save();
        res.json({ success: true, scheme });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;