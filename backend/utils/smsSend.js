const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const SERVER_KEY = "YOUR_FIREBASE_SERVER_KEY"; // Get from Firebase Console

// 🔹 Send Push Notification
app.post("/send-notification", async (req, res) => {
    const { token, title, body } = req.body;

    const message = {
        to: token,
        notification: {
            title: title,
            body: body,
        }
    };

    try {
        const response = await axios.post("https://fcm.googleapis.com/fcm/send", message, {
            headers: {
                "Authorization": `key=${SERVER_KEY}`,
                "Content-Type": "application/json"
            }
        });
        res.json({ success: true, response: response.data });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// Start Server
app.listen(3001, () => console.log("Server running on port 3001"));
