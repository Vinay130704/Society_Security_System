const express = require('express');
const { sendAlert } = require('../utils/alertService'); // Import alert service
const Incident = require('../models/Incident'); // Import Incident model (if using MongoDB)

const router = express.Router();

// 📌 Report an Incident & Send Alert
router.post('/report', async (req, res) => {
    try {
        const { recipientEmail, incidentTitle, incidentDescription } = req.body;

        // 🚨 Check if recipient email is provided
        if (!recipientEmail) {
            return res.status(400).json({ error: "Recipient email is required!" });
        }

        // ✅ Save incident to database (if needed)
        const newIncident = new Incident({
            title: incidentTitle,
            description: incidentDescription,
            date: new Date()
        });
        await newIncident.save(); // Save to MongoDB

        // ✉️ Send Email Alert
        sendAlert(recipientEmail, incidentTitle, incidentDescription);

        res.status(201).json({ message: "Incident reported and alert sent!" });
    } catch (error) {
        console.error("Error reporting incident:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
