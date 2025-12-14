const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');

// 1. RECORD A PURCHASE
// Call this from frontend AFTER handleBuy() succeeds
router.post('/purchase', async (req, res) => {
    const { walletAddress, contentId, txSignature } = req.body;

    try {
        // 1. Find the course to get its MongoDB _id
        const course = await Course.findOne({ contentId });
        if (!course) return res.status(404).json({ msg: "Course not found" });

        // 2. Find User (or create if new)
        let user = await User.findOne({ walletAddress });
        if (!user) {
            user = new User({ walletAddress, purchasedCourses: [] });
        }

        // 3. Check if already bought to prevent duplicates
        const alreadyBought = user.purchasedCourses.some(
            (item) => item.course.toString() === course._id.toString()
        );

        if (!alreadyBought) {
            user.purchasedCourses.push({
                course: course._id,
                txSignature: txSignature
            });
            await user.save();
            
            // Optional: Increment course purchase count
            course.purchases += 1;
            await course.save();
        }

        res.json({ success: true, user });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// 2. GET USER'S LIBRARY
// Returns full details of courses the user owns
router.get('/:walletAddress', async (req, res) => {
    try {
        const user = await User.findOne({ walletAddress: req.params.walletAddress })
            .populate('purchasedCourses.course'); // <--- MAGIC: Fills in title, price, arweaveId automatically

        if (!user) return res.json([]); // Return empty array if new user

        // Return just the course list
        const library = user.purchasedCourses.map(p => p.course);
        res.json(library);

    } catch (err) {
        res.status(500).send("Server Error");
    }
});

module.exports = router;