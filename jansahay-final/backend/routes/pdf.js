const express = require('express');
const router = express.Router();
const multer = require('multer');
const Scheme = require('../models/Scheme');

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

router.post('/upload', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        const scheme = new Scheme({
            name: req.body.name || "PDF Uploaded Scheme",
            category: req.body.category || "other",
            pdfSource: req.file.filename,
            aiVerified: true
        });
        
        await scheme.save();
        res.json({ success: true, message: 'PDF uploaded and scheme added', scheme });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;