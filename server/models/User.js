const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    walletAddress: { 
        type: String, 
        required: true, 
        unique: true 
    },
    // We store an array of Course Object IDs.
    // This allows us to "populate" (fetch) the full course details easily.
    purchasedCourses: [{
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        },
        purchasedAt: {
            type: Date,
            default: Date.now
        },
        txSignature: {
            type: String // The receipt signature from Solana
        }
    }]
});

module.exports = mongoose.model('User', UserSchema);