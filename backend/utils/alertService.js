const nodemailer = require('nodemailer');
const twilio = require('twilio');

// 📌 SMS Alert Function using Twilio
const sendSmsAlert = (phoneNumber, message) => {
    console.log(`Sending SMS to ${phoneNumber}: ${message}`);

    // Use environment variables for security
    const accountSid = process.env.TWILIO_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioNumber) {
        console.error("Twilio credentials are missing in environment variables.");
        return;
    }

    const client = twilio(accountSid, authToken);

    client.messages.create({
        body: message,
        to: phoneNumber,
        from: twilioNumber  // ✅ Use a Twilio-verified number
    })
    .then((message) => console.log("SMS sent: ", message.sid))
    .catch((error) => console.error("SMS Error: ", error));
};

// 📌 Email Alert Function using Nodemailer
const sendAlert = (recipientEmail, incidentTitle, incidentDescription) => {
    const userEmail = process.env.SENDER_EMAIL;
    const userPassword = process.env.EMAIL_APP_PASSWORD;

    if (!userEmail || !userPassword) {
        console.error("Email credentials are missing in environment variables.");
        return;
    }

    if (!recipientEmail) {
        console.error("Recipient email is missing!");
        return;
    }

    console.log(`Sending Alert from ${userEmail} to ${recipientEmail}: ${incidentTitle} - ${incidentDescription}`);

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: userEmail,
            pass: userPassword, // Use an App Password, NOT your Gmail password
        }
    });

    const mailOptions = {
        from: userEmail,
        to: recipientEmail,
        subject: "Incident Alert",
        text: `Alert: ${incidentTitle} - ${incidentDescription}`
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error("Error sending email:", err);
        } else {
            console.log("Email sent:", info.response);
        }
    });
};

module.exports = { sendAlert, sendSmsAlert };
