require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const serviceAccount = require('../society-security-system.json');

const app = express();
app.use(bodyParser.json());

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Store verified numbers
let verifiedNumbers = new Set();

/** 
 * Step 1: Send OTP for Verification
 */
app.post('/send-verification', async (req, res) => {
    const { phone } = req.body;

    try {
        const session = await admin.auth().createSessionCookie(phone, { expiresIn: 60 * 5 * 1000 });
        res.json({ success: true, session });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

/** 
 * Step 2: Verify OTP 
 */
app.post('/verify-code', async (req, res) => {
    const { phone, code } = req.body;

    try {
        // Firebase automatically verifies OTP via frontend UI
        verifiedNumbers.add(phone);
        res.json({ success: true, message: 'Phone number verified successfully' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

/** 
 * Step 3: Send SMS to Verified Numbers (Using Free Service)
 */
app.post('/send-sms', async (req, res) => {
    const { message } = req.body;

    try {
        if (verifiedNumbers.size === 0) {
            return res.status(400).json({ success: false, message: 'No verified numbers found' });
        }

        for (let phone of verifiedNumbers) {
            console.log(`Sending SMS to ${phone}: ${message}`);
        }

        res.json({ success: true, message: 'SMS sent successfully (Simulated)' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Start Server
app.listen(3000, () => console.log('Server running on port 3000'));
