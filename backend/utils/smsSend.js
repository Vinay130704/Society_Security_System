require('dotenv').config({ path: '../.env' });
const twilio = require('twilio');

// Twilio Credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

const client = new twilio(accountSid, authToken);

// Function to send SMS
client.messages.create({  // "message" nahi, "messages" likhna hai
    body: "Hello Vansh ",
    to: "+918219984723",   // Receiver's number
    from: twilioNumber   // Twilio's assigned number
})
.then(message => console.log("Message sent with SID:", message.sid))
.catch(error => console.error("Error sending SMS:", error));
