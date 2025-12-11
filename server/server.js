const express = require('express');
const app = express();
const Course = require('./models/Course'); // Import the schema above

// POST /api/courses/create
app.post('/create', async (req, res) => {
    try {
        const { 
            contentId, 
            title, 
            price, 
            arweaveId, 
            sellerPublicKey, 
            solanaTxSignature 
        } = req.body;

        // Create new entry
        const newCourse = new Course({
            contentId,
            title,
            price,
            arweaveId,
            sellerPublicKey,
            solanaTxSignature
        });

        // Save to MongoDB
        await newCourse.save();

        res.status(201).json({ 
            success: true, 
            message: "Course indexed successfully", 
            data: newCourse 
        });

    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to save course", 
            error: error.message 
        });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});