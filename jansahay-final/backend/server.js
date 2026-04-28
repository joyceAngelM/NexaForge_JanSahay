const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    applyProcess: String,
    helpline: String,
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
        eligibility: "All landholding farmers",
        applyProcess: "Visit pmkisan.gov.in or nearest CSC center",
        helpline: "155261"
    },
    { 
        name: "Ayushman Bharat PM-JAY", 
        category: "health", 
        benefits: ["₹5 lakh free health cover per family", "Cashless treatment", "10+ crore families covered"],
        documents: ["Aadhaar card", "Ration card"],
        description: "World's largest government health insurance scheme",
        eligibility: "Families identified as deprived rural/urban",
        applyProcess: "Visit nearest empaneled hospital or CSC center",
        helpline: "14555"
    },
    { 
        name: "Pradhan Mantri Awas Yojana (PMAY)", 
        category: "housing", 
        benefits: ["₹2.67 lakh interest subsidy", "Permanent house for urban poor", "Women ownership priority"],
        documents: ["Aadhaar", "Income certificate", "Bank account"],
        description: "Housing for all scheme",
        eligibility: "EWS/LIG families with annual income up to ₹6 lakh",
        applyProcess: "Apply online at pmaymis.gov.in",
        helpline: "1800-11-3377"
    },
    { 
        name: "Sukanya Samriddhi Yojana (SSY)", 
        category: "women", 
        benefits: ["7.6% interest rate", "Tax benefits under 80C", "Girl child education fund"],
        documents: ["Girl child birth certificate", "Parent Aadhaar"],
        description: "Small savings scheme for girl child",
        eligibility: "Girl child below 10 years of age",
        applyProcess: "Open account at any post office or bank",
        helpline: "1800-180-1111"
    },
    { 
        name: "Pradhan Mantri Mudra Yojana (PMMY)", 
        category: "business", 
        benefits: ["Loans up to ₹10 lakhs", "No collateral required", "Three categories: Shishu, Kishor, Tarun"],
        documents: ["Business plan", "KYC documents", "Bank account"],
        description: "Funding for small and micro enterprises",
        eligibility: "All small business owners",
        applyProcess: "Apply at any bank branch",
        helpline: "1800-180-1111"
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

// ============ MULTI-LANGUAGE VOICE ASSISTANT ============

// Multi-language responses for each scheme
function getResponseInLanguage(schemeType, language, query) {
    const q = query.toLowerCase();
    
    // Telugu detection
    const isTelugu = /[\u0C00-\u0C7F]/.test(query);
    const isKannada = /[\u0C80-\u0CFF]/.test(query);
    const isTamil = /[\u0B80-\u0BFF]/.test(query);
    const isMalayalam = /[\u0D00-\u0D7F]/.test(query);
    const isHindi = /[\u0900-\u097F]/.test(query);
    
    let finalLang = language;
    if (isTelugu) finalLang = 'te';
    else if (isKannada) finalLang = 'kn';
    else if (isTamil) finalLang = 'ta';
    else if (isMalayalam) finalLang = 'ml';
    else if (isHindi) finalLang = 'hi';
    
    // PM-KISAN
    if (q.includes('kisan') || q.includes('pm-kisan') || q.includes('किसान') || q.includes('కిసాన్') || q.includes('ಕಿಸಾನ್')) {
        const responses = {
            'hi': 'PM-KISAN सम्मान निधि योजना: किसानों को ₹6000 सालाना मिलते हैं। यह तीन किस्तों में ₹2000 देकर सीधे बैंक खाते में भेजे जाते हैं। दस्तावेज: आधार कार्ड, भूमि रिकॉर्ड, बैंक खाता। पात्रता: सभी छोटे किसान। हेल्पलाइन: 155261।',
            'te': 'PM-KISAN సమ్మాన్ నిధి పథకం: రైతులకు సంవత్సరానికి ₹6000 అందించబడతాయి. ఇది మూడు వాయిదాల్లో ₹2000 చొప్పున నేరుగా బ్యాంకు ఖాతాలో జమచేయబడుతుంది. పత్రాలు: ఆధార్ కార్డ్, భూమి రికార్డులు, బ్యాంకు ఖాతా. అర్హత: అన్ని చిన్న రైతులు. హెల్ప్లైన్: 155261.',
            'kn': 'PM-KISAN ಸಮ್ಮಾನ್ ನಿಧಿ ಯೋಜನೆ: ರೈತರಿಗೆ ವರ್ಷಕ್ಕೆ ₹6000 ನೀಡಲಾಗುತ್ತದೆ. ಇದನ್ನು ಮೂರು ಕಂತುಗಳಲ್ಲಿ ₹2000 ರಂತೆ ನೇರವಾಗಿ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜಮಾ ಮಾಡಲಾಗುತ್ತದೆ. ದಾಖಲೆಗಳು: ಆಧಾರ್ ಕಾರ್ಡ್, ಭೂಮಿ ದಾಖಲೆಗಳು, ಬ್ಯಾಂಕ್ ಖಾತೆ. ಅರ್ಹತೆ: ಎಲ್ಲಾ ಸಣ್ಣ ರೈತರು. ಸಹಾಯವಾಣಿ: 155261.',
            'ta': 'PM-KISAN சம்மான் நிதி திட்டம்: விவசாயிகளுக்கு ஆண்டுக்கு ₹6000 வழங்கப்படுகிறது. இது மூன்று தவணைகளில் ₹2000 வீதம் நேரடியாக வங்கிக் கணக்கில் செலுத்தப்படுகிறது. ஆவணங்கள்: ஆதார் அட்டை, நிலப் பதிவுகள், வங்கிக் கணக்கு. தகுதி: அனைத்து சிறு விவசாயிகள். உதவி எண்: 155261.',
            'ml': 'PM-KISAN സമ്മാൻ നിധി പദ്ധതി: കർഷകർക്ക് വർഷത്തിൽ ₹6000 നൽകുന്നു. മൂന്ന് ഗഡുക്കളിലായി ₹2000 വീതം നേരിട്ട് ബാങ്ക് അക്കൗണ്ടിലേക്ക് നൽകുന്നു. രേഖകൾ: ആധാർ കാർഡ്, ഭൂമി രേഖകൾ, ബാങ്ക് അക്കൗണ്ട്. യോഗ്യത: എല്ലാ ചെറുകിട കർഷകർ. ഹെൽപ്പ്‌ലൈൻ: 155261.',
            'bn': 'PM-KISAN সম্মান নিধি প্রকল্প: কৃষকদের বার্ষিক ₹6000 দেওয়া হয়। এটি তিনটি কিস্তিতে ₹2000 করে সরাসরি ব্যাংক অ্যাকাউন্টে প্রদান করা হয়। নথি: আধার কার্ড, জমির রেকর্ড, ব্যাংক অ্যাকাউন্ট। যোগ্যতা: সমস্ত ক্ষুদ্র কৃষক। হেল্পলাইন: 155261.',
            'en': 'PM-KISAN Samman Nidhi Scheme: Farmers get ₹6000 per year. This is given in three installments of ₹2000 each directly to bank account. Documents: Aadhaar card, land records, bank account. Eligibility: All small farmers. Helpline: 155261.'
        };
        return responses[finalLang] || responses['en'];
    }
    
    // Ayushman Bharat
    if (q.includes('ayushman') || q.includes('health') || q.includes('स्वास्थ्य') || q.includes('ఆరోగ్యం') || q.includes('ಆರೋಗ್ಯ')) {
        const responses = {
            'hi': 'आयुष्मान भारत योजना: प्रति वर्ष ₹5 लाख तक मुफ्त इलाज। कैशलेस उपचार की सुविधा। दस्तावेज: आधार कार्ड, राशन कार्ड। पात्रता: गरीबी रेखा से नीचे के परिवार। हेल्पलाइन: 14555।',
            'te': 'ఆయుష్మాన్ భారత్ పథకం: సంవత్సరానికి ₹5 లక్షల వరకు ఉచిత చికిత్స. క్యాష్‌లెస్ చికిత్స సౌకర్యం. పత్రాలు: ఆధార్ కార్డ్, రేషన్ కార్డ్. అర్హత: పేదరికం రేఖకు దిగువన ఉన్న కుటుంబాలు. హెల్ప్లైన్: 14555.',
            'kn': 'ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ಯೋಜನೆ: ವರ್ಷಕ್ಕೆ ₹5 ಲಕ್ಷದವರೆಗೆ ಉಚಿತ ಚಿಕಿತ್ಸೆ. ಕ್ಯಾಷ್‌ಲೆಸ್ ಚಿಕಿತ್ಸೆ ಸೌಲಭ್ಯ. ದಾಖಲೆಗಳು: ಆಧಾರ್ ಕಾರ್ಡ್, ರೇಷನ್ ಕಾರ್ಡ್. ಅರ್ಹತೆ: ಬಡತನ ರೇಖೆಗಿಂತ ಕೆಳಗಿನ ಕುಟುಂಬಗಳು. ಸಹಾಯವಾಣಿ: 14555.',
            'ta': 'ஆயுஷ்மான் பாரத் திட்டம்: ஆண்டுக்கு ₹5 லட்சம் வரை இலவச சிகிச்சை. கேஷ்லெஸ் சிகிச்சை வசதி. ஆவணங்கள்: ஆதார் அட்டை, ரேஷன் அட்டை. தகுதி: வறுமைக் கோட்டிற்கு கீழ் உள்ள குடும்பங்கள். உதவி எண்: 14555.',
            'en': 'Ayushman Bharat Scheme: Free treatment up to ₹5 lakh per year. Cashless treatment facility. Documents: Aadhaar card, ration card. Eligibility: Families below poverty line. Helpline: 14555.'
        };
        return responses[finalLang] || responses['en'];
    }
    
    // Mudra Yojana
    if (q.includes('mudra') || q.includes('business') || q.includes('व्यवसाय') || q.includes('వ్యాపారం') || q.includes('ವ್ಯಾಪಾರ')) {
        const responses = {
            'hi': 'प्रधानमंत्री मुद्रा योजना: ₹10 लाख तक का लोन, बिना गारंटी। तीन श्रेणियां: शिशु (₹50,000 तक), किशोर (₹5 लाख तक), तरुण (₹10 लाख तक)। दस्तावेज: व्यवसाय योजना, KYC। हेल्पलाइन: 1800-180-1111।',
            'te': 'ప్రధాన్ మంత్రి ముద్రా పథకం: ₹10 లక్షల వరకు రుణం, గ్యారంటీ లేదు. మూడు విభాగాలు: శిశు (₹50,000 వరకు), కిశోర్ (₹5 లక్షల వరకు), తరుణ్ (₹10 లక్షల వరకు). పత్రాలు: వ్యాపార ప్రణాళిక, KYC. హెల్ప్లైన్: 1800-180-1111.',
            'kn': 'ಪ್ರಧಾನ ಮಂತ್ರಿ ಮುದ್ರಾ ಯೋಜನೆ: ₹10 ಲಕ್ಷದವರೆಗೆ ಸಾಲ, ಯಾವುದೇ ಗ್ಯಾರಂಟಿ ಇಲ್ಲ. ಮೂರು ವಿಭಾಗಗಳು: ಶಿಶು (₹50,000 ವರೆಗೆ), ಕಿಶೋರ್ (₹5 ಲಕ್ಷದವರೆಗೆ), ತರುಣ್ (₹10 ಲಕ್ಷದವರೆಗೆ). ದಾಖಲೆಗಳು: ವ್ಯಾಪಾರ ಯೋಜನೆ, KYC. ಸಹಾಯವಾಣಿ: 1800-180-1111.',
            'ta': 'பிரதான் மந்திரி முத்ரா திட்டம்: ₹10 லட்சம் வரை கடன், எந்த உத்தரவாதமும் இல்லை. மூன்று பிரிவுகள்: ஷிஷு (₹50,000 வரை), கிஷோர் (₹5 லட்சம் வரை), தருண் (₹10 லட்சம் வரை). ஆவணங்கள்: வணிக திட்டம், KYC. உதவி எண்: 1800-180-1111.',
            'en': 'Pradhan Mantri Mudra Yojana: Loan up to ₹10 lakhs, no collateral needed. Three categories: Shishu (up to ₹50,000), Kishor (up to ₹5 lakhs), Tarun (up to ₹10 lakhs). Documents: Business plan, KYC. Helpline: 1800-180-1111.'
        };
        return responses[finalLang] || responses['en'];
    }
    
    // Sukanya Samriddhi
    if (q.includes('sukanya') || q.includes('girl') || q.includes('बेटी') || q.includes('కూతురు') || q.includes('ಕನ್ಯಾ')) {
        const responses = {
            'hi': 'सुकन्या समृद्धि योजना: बेटियों की शिक्षा और विवाह के लिए बचत योजना। ब्याज दर 7.6%। न्यूनतम जमा ₹250, अधिकतम ₹1.5 लाख सालाना। पात्रता: 10 साल से कम उम्र की बेटियां।',
            'te': 'సుకన్య సమృద్ధి పథకం: కూతుళ్ల విద్య మరియు వివాహం కోసం పొదుపు పథకం. వడ్డీ రేటు 7.6%. కనీస డిపాజిట్ ₹250, గరిష్ట ₹1.5 లక్షలు సంవత్సరానికి. అర్హత: 10 సంవత్సరాల లోపు కూతుళ్లు.',
            'kn': 'ಸುಕನ್ಯ ಸಮೃದ್ಧಿ ಯೋಜನೆ: ಹೆಣ್ಣು ಮಕ್ಕಳ ಶಿಕ್ಷಣ ಮತ್ತು ಮದುವೆಗಾಗಿ ಉಳಿತಾಯ ಯೋಜನೆ. ಬಡ್ಡಿ ದರ 7.6%. ಕನಿಷ್ಠ ಠೇವಣಿ ₹250, ಗರಿಷ್ಠ ₹1.5 ಲಕ್ಷ ವಾರ್ಷಿಕ. ಅರ್ಹತೆ: 10 ವರ್ಷದೊಳಗಿನ ಹೆಣ್ಣು ಮಕ್ಕಳು.',
            'ta': 'சுகன்யா சம்ரித்தி திட்டம்: பெண் குழந்தைகளின் கல்வி மற்றும் திருமணத்திற்கான சேமிப்பு திட்டம். வட்டி விகிதம் 7.6%. குறைந்தபட்ச டெபாசிட் ₹250, அதிகபட்சம் ₹1.5 லட்சம் ஆண்டுக்கு. தகுதி: 10 வயதுக்குட்பட்ட பெண் குழந்தைகள்.',
            'en': 'Sukanya Samriddhi Yojana: Savings scheme for girl child education and marriage. Interest rate 7.6%. Minimum deposit ₹250, maximum ₹1.5 lakh per year. Eligibility: Girl child below 10 years.'
        };
        return responses[finalLang] || responses['en'];
    }
    
    // PM Awas Yojana
    if (q.includes('awas') || q.includes('housing') || q.includes('आवास') || q.includes('గృహ') || q.includes('ಮನೆ')) {
        const responses = {
            'hi': 'प्रधानमंत्री आवास योजना: ₹2.67 लाख तक ब्याज सब्सिडी। महिलाओं को प्राथमिकता। पात्रता: वार्षिक आय ₹6 लाख तक। हेल्पलाइन: 1800-11-3377।',
            'te': 'ప్రధాన్ మంత్రి ఆవాస్ యోజన: ₹2.67 లక్షల వరకు వడ్డీ సబ్సిడీ. మహిళలకు ప్రాధాన్యత. అర్హత: వార్షిక ఆదాయం ₹6 లక్షల వరకు. హెల్ప్లైన్: 1800-11-3377.',
            'kn': 'ಪ್ರಧಾನ ಮಂತ್ರಿ ಆವಾಸ್ ಯೋಜನೆ: ₹2.67 ಲಕ್ಷದವರೆಗೆ ಬಡ್ಡಿ ಸಬ್ಸಿಡಿ. ಮಹಿಳೆಯರಿಗೆ ಆದ್ಯತೆ. ಅರ್ಹತೆ: ವಾರ್ಷಿಕ ಆದಾಯ ₹6 ಲಕ್ಷದವರೆಗೆ. ಸಹಾಯವಾಣಿ: 1800-11-3377.',
            'ta': 'பிரதான் மந்திரி ஆவாஸ் யோஜனா: ₹2.67 லட்சம் வரை வட்டி மானியம். மகளிருக்கு முன்னுரிமை. தகுதி: ஆண்டு வருமானம் ₹6 லட்சம் வரை. உதவி எண்: 1800-11-3377.',
            'en': 'Pradhan Mantri Awas Yojana: Interest subsidy up to ₹2.67 lakh. Priority to women. Eligibility: Annual income up to ₹6 lakh. Helpline: 1800-11-3377.'
        };
        return responses[finalLang] || responses['en'];
    }
    
    // Help / Default
    const helpResponses = {
        'hi': 'JanSahay सहायक: मैं सरकारी योजनाओं के बारे में जानकारी दे सकता हूँ। कृपया पूछें: PM-KISAN, आयुष्मान भारत, मुद्रा योजना, सुकन्या समृद्धि, या प्रधानमंत्री आवास योजना। हेल्पलाइन: 1800-180-1111।',
        'te': 'JanSahay సహాయక: నేను ప్రభుత్వ పథకాల గురించి సమాచారం అందించగలను. దయచేసి అడగండి: PM-KISAN, ఆయుష్మాన్ భారత్, ముద్రా పథకం, సుకన్య సమృద్ధి, లేదా ప్రధాన్ మంత్రి ఆవాస్ యోజన. హెల్ప్లైన్: 1800-180-1111.',
        'kn': 'JanSahay ಸಹಾಯಕ: ನಾನು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿ ನೀಡಬಲ್ಲೆ. ದಯವಿಟ್ಟು ಕೇಳಿ: PM-KISAN, ಆಯುಷ್ಮಾನ್ ಭಾರತ್, ಮುದ್ರಾ ಯೋಜನೆ, ಸುಕನ್ಯ ಸಮೃದ್ಧಿ, ಅಥವಾ ಪ್ರಧಾನ ಮಂತ್ರಿ ಆವಾಸ್ ಯೋಜನೆ. ಸಹಾಯವಾಣಿ: 1800-180-1111.',
        'ta': 'JanSahay உதவியாளர்: நான் அரசு திட்டங்களைப் பற்றி தகவல்களை வழங்க முடியும். தயவுசெய்து கேளுங்கள்: PM-KISAN, ஆயுஷ்மான் பாரத், முத்ரா திட்டம், சுகன்யா சம்ரித்தி, அல்லது பிரதான் மந்திரி ஆவாஸ் யோஜனா. உதவி எண்: 1800-180-1111.',
        'en': 'JanSahay Assistant: I can provide information about government schemes. Please ask about: PM-KISAN, Ayushman Bharat, Mudra Yojana, Sukanya Samriddhi, or PM Awas Yojana. Helpline: 1800-180-1111.'
    };
    return helpResponses[finalLang] || helpResponses['en'];
}

app.post('/api/voice/assistant', async (req, res) => {
    try {
        const { query, language = 'en' } = req.body;
        
        console.log(`Voice query received: "${query}"`);
        
        if (!query || query.trim() === '') {
            const helpMsg = getResponseInLanguage('help', language, '');
            return res.json({ success: true, response: helpMsg });
        }
        
        const response = getResponseInLanguage(null, language, query);
        console.log(`Response sent in detected language`);
        res.json({ success: true, response });
        
    } catch (error) {
        console.error('Voice error:', error);
        res.json({ success: true, response: "Sorry, please try again. कृपया पुनः प्रयास करें. దయచేసి మళ్లీ ప్రయత్నించండి." });
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});