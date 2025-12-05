require("dotenv").config();
const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (to, message) => {
  try {
    if (!to.startsWith("+")) {
      throw new Error("Phone number must include country code. Example: +918219136254");
    }

    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio number
      to
    });

    return {
      success: true,
      sid: response.sid,
      status: response.status,
      to: response.to
    };

  } catch (error) {
    console.error("Twilio Error =>", error);
    throw new Error(error.message);
  }
};

module.exports = sendSMS;
