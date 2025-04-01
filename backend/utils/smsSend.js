require("dotenv").config(); // Load environment variables
const twilio = require("twilio");

// Debug: Log environment variables (DO NOT log them in production)
console.log("TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID ? "Loaded" : "Not Loaded");
console.log("TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN ? "Loaded" : "Not Loaded");
console.log("TWILIO_PHONE_NUMBER:", process.env.TWILIO_PHONE_NUMBER ? "Loaded" : "Not Loaded");

// Load Twilio credentials from .env file
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

// Ensure all credentials are loaded
if (!accountSid || !authToken || !fromPhone) {
  console.error("❌ Twilio environment variables are missing! Check your .env file.");
  process.exit(1);
}

// Create Twilio client
const client = twilio(accountSid, authToken);

// Function to send SMS
const sendSMS = async (to, message) => {
  try {
    const response = await client.messages.create({
      body: message,
      from: fromPhone, // Must be a Twilio-approved number
      to: to, // Recipient's phone number
    });
    console.log("✅ SMS sent successfully:", response.sid);
  } catch (error) {
    console.error("❌ Error sending SMS:", error.message);
  }
};

// ✅ **Test the function**
sendSMS("+918219136254", "Hello from Twilio via Node.js!");
