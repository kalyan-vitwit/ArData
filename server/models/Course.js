const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    contentId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    title: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    arweaveId: { 
        type: String, 
        required: true 
    },
    sellerPublicKey: { 
        type: String, 
        required: true 
    },
    solanaTxSignature: { 
        type: String, 
        required: true 
    },
    // Useful for showing "Newest Courses"
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    // Track how many people bought it (optional update later)
    purchases: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Course', CourseSchema);