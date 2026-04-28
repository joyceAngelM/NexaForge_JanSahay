const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads folder
const fs = require('fs');
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

// ============ MODELS ============
const userSchema = new mongoose.Schema({
    mobileNumber: { type: String, required: true, unique: true },
    otp: String,
    otpExpiry: Date,
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const schemeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, enum: ['health', 'housing', 'women', 'business', 'farmer', 'education', 'other'], default: 'other' },
    benefits: [String],
    documents: [String],
    description: String,
    eligibility: String,
    aiVerified: { type: Boolean, default: true },
    pdfSource: String,
    createdAt: { type: Date, default: Date.now }
});
const Scheme = mongoose.model('Scheme', schemeSchema);

// ============ DEFAULT SCHEMES ============
const defaultSchemes = [
    { 
        name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)", 
        category: "farmer", 
        benefits: ["₹6000 per year income support", "Three equal installments of ₹2000 each", "Direct bank transfer"],
        documents: ["Aadhaar card", "Land records", "Bank account details"],
        description: "Financial benefit for small and marginal farmers",
        eligibility: "All landholding farmers"
    },
    { 
        name: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)", 
        category: "health", 
        benefits: ["Free health coverage up to ₹5 lakhs per family", "Cashless treatment", "10+ crore families covered"],
        documents: ["Aadhaar card", "Ration card", "Socio-economic census data"],
        description: "World's largest government health insurance scheme",
        eligibility: "Families identified as deprived rural/urban"
    },
    { 
        name: "Pradhan Mantri Awas Yojana (PMAY-Urban)", 
        category: "housing", 
        benefits: ["Interest subsidy up to ₹2.67 lakh", "Permanent house for urban poor", "Women ownership priority"],
        documents: ["Aadhaar", "Income certificate", "Bank account"],
        description: "Housing for all by 2022 scheme",
        eligibility: "EWS/LIG families with annual income up to ₹6 lakh"
    },
    { 
        name: "Sukanya Samriddhi Yojana (SSY)", 
        category: "women", 
        benefits: ["7.6% interest rate", "Tax benefits under 80C", "Girl child education and marriage fund"],
        documents: ["Girl child birth certificate", "Parent Aadhaar", "Bank account"],
        description: "Small savings scheme for girl child",
        eligibility: "Girl child below 10 years of age"
    },
    { 
        name: "Pradhan Mantri Mudra Yojana (PMMY)", 
        category: "business", 
        benefits: ["Loans up to ₹10 lakhs", "No collateral required", "Three categories: Shishu, Kishor, Tarun"],
        documents: ["Business plan", "KYC documents", "Bank account"],
        description: "Funding for small and micro enterprises",
        eligibility: "All small business owners"
    }
];

// ============ DATABASE CONNECTION ============
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jansahay';

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('MongoDB Connected Successfully!');
        const count = await Scheme.countDocuments();
        if (count === 0) {
            await Scheme.insertMany(defaultSchemes);
            console.log('Default schemes added to database');
        }
    })
    .catch(err => console.error('MongoDB Error:', err.message));

// ============ HELPER FUNCTIONS ============
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ============ AUTH ROUTES ============
app.post('/api/auth/send-otp', async (req, res) => {
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
        console.log(`OTP for ${mobileNumber}: ${otp}`);
        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/auth/verify-otp', async (req, res) => {
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

// ============ SCHEMES ROUTES ============
app.get('/api/schemes', async (req, res) => {
    try {
        let schemes = await Scheme.find().sort({ createdAt: -1 });
        if (schemes.length === 0) schemes = defaultSchemes;
        res.json({ success: true, schemes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, schemes: defaultSchemes });
    }
});

app.post('/api/schemes', async (req, res) => {
    try {
        const scheme = new Scheme(req.body);
        await scheme.save();
        res.json({ success: true, scheme });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ VOICE ASSISTANT ROUTE (Short & Clean) ============
app.post('/api/voice/assistant', async (req, res) => {
    try {
        const { query } = req.body;
        
        console.log(`Voice query: "${query}"`);
        
        if (!query || query.trim() === '') {
            return res.json({ success: true, response: "कृपया कुछ पूछें। Please ask about PM-KISAN, Ayushman, Mudra, Sukanya, or Awas Yojana." });
        }
        
        const q = query.toLowerCase();
        let response = "";
        
        if (q.includes('pm-kisan') || q.includes('kisan') || q.includes('किसान')) {
            response = "PM-KISAN: किसानों को ₹6000 सालाना। तीन किस्तों में ₹2000। पात्रता: सभी किसान। दस्तावेज: आधार, भूमि रिकॉर्ड, बैंक खाता। हेल्पलाइन: 155261";
        }
        else if (q.includes('ayushman') || q.includes('health') || q.includes('स्वास्थ्य')) {
            response = "Ayushman Bharat: ₹5 लाख तक मुफ्त इलाज। 10 करोड़ परिवार कवर। कैशलेस उपचार। हेल्पलाइन: 14555";
        }
        else if (q.includes('awas') || q.includes('housing') || q.includes('आवास')) {
            response = "PM Awas Yojana: ₹2.67 लाख ब्याज सब्सिडी। महिलाओं को प्राथमिकता। पात्रता: आय ₹6 लाख तक। हेल्पलाइन: 1800-11-3377";
        }
        else if (q.includes('mudra') || q.includes('business') || q.includes('व्यवसाय')) {
            response = "Mudra Yojana: ₹50,000 से ₹10 लाख तक लोन। तीन श्रेणियां: शिशु, किशोर, तरुण। बिना गारंटी। हेल्पलाइन: 1800-180-1111";
        }
        else if (q.includes('sukanya') || q.includes('girl') || q.includes('बेटी')) {
            response = "Sukanya Samriddhi: 7.6% ब्याज। सालाना ₹250 से ₹1.5 लाख जमा। पात्रता: 10 साल से कम उम्र की बेटियां।";
        }
        else if (q.includes('all schemes') || q.includes('सभी योजनाएं')) {
            response = "प्रमुख योजनाएं: PM-KISAN (किसान), Ayushman Bharat (स्वास्थ्य), PM Awas (आवास), Mudra (व्यवसाय), Sukanya Samriddhi (बेटियां)";
        }
        else if (q.includes('help') || q.includes('मदद')) {
            response = "मैं ये बता सकता हूं: PM-KISAN, Ayushman Bharat, PM Awas, Mudra Yojana, Sukanya Samriddhi। कोई भी योजना का नाम बताएं। हेल्पलाइन: 1800-180-1111";
        }
        else {
            response = "कृपया पूछें: PM-KISAN, Ayushman Bharat, PM Awas, Mudra Yojana, या Sukanya Samriddhi। हेल्पलाइन: 1800-180-1111";
        }
        
        res.json({ success: true, response });
        
    } catch (error) {
        console.error('Voice error:', error);
        res.json({ success: true, response: "क्षमा करें। कृपया PM-KISAN, Ayushman, Mudra, Sukanya, या Awas के बारे में पूछें।" });
    }
});

// ============ PDF UPLOAD ROUTE ============
const upload = multer({ dest: './uploads/' });

app.post('/api/pdf/upload', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        const scheme = new Scheme({
            name: req.body.name || "PDF Uploaded Scheme",
            category: req.body.category || "other",
            benefits: req.body.benefits ? req.body.benefits.split(',') : ["Government scheme benefits"],
            documents: req.body.documents ? req.body.documents.split(',') : ["Required documents"],
            pdfSource: req.file.filename,
            aiVerified: true
        });
        
        await scheme.save();
        console.log(`PDF uploaded: ${req.file.filename}`);
        res.json({ success: true, message: 'PDF uploaded and scheme added', scheme });
    } catch (error) {
        console.error('PDF upload error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ HEALTH CHECK ============
app.get('/', (req, res) => {
    res.json({ 
        success: true, 
        message: 'JanSahay API Running!',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});