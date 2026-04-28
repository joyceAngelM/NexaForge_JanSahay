const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');

router.post('/assistant', async (req, res) => {
    try {
        const { query } = req.body;
        const schemes = await Scheme.find().limit(3);
        
        let response = "नमस्ते! मैं JanSahay सहायक हूँ। कृपया अपनी ज़रूरत बताएं।";
        
        if (query.toLowerCase().includes('scheme')) {
            response = `यहाँ कुछ योजनाएं हैं: ${schemes.map(s => s.name).join(', ')}`;
        }
        
        res.json({ success: true, response });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;