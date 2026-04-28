const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, enum: ['health', 'housing', 'women', 'business', 'farmer', 'education', 'other'], default: 'other' },
    benefits: [String],
    documents: [String],
    aiVerified: { type: Boolean, default: true },
    pdfSource: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Scheme', schemeSchema);