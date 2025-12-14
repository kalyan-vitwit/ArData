// File: routes/courses.js
const express = require('express');
const router = express.Router();
const Course = require('../models/Course'); // Make sure this path points to your model

// 1. GET ALL COURSES
// Route: GET /api/courses/all
router.get('/all', async (req, res) => {
    try {
        const courses = await Course.find().select('-__v'); 
        res.status(200).json(courses);
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ message: "Failed to fetch courses" });
    }
});

// 2. GET SINGLE COURSE
// Route: GET /api/courses/:contentId
router.get('/:contentId', async (req, res) => {
    try {
        const { contentId } = req.params;
        const course = await Course.findOne({ contentId: contentId });

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        res.status(200).json(course);
    } catch (error) {
        console.error("Fetch Single Error:", error);
        res.status(500).json({ message: "Failed to fetch course details" });
    }
});

// 3. CREATE COURSE
// Route: POST /api/courses/create
router.post('/create', async (req, res) => {
    try {
        const { 
            contentId, title, price, arweaveId, 
            sellerPublicKey, solanaTxSignature 
        } = req.body;

        const newCourse = new Course({
            contentId, title, price, arweaveId,
            sellerPublicKey, solanaTxSignature
        });

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

module.exports = router;