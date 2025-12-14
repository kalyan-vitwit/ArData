const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    contentId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String }, // Added description
    price: { type: Number, required: true },
    arweaveId: { type: String, required: true },
    sellerPublicKey: { type: String, required: true },
    solanaTxSignature: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    purchases: { type: Number, default: 0 }
});

module.exports = mongoose.model('Course', CourseSchema);