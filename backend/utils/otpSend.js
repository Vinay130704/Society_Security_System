const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Store OTPs temporarily (for production, use Redis or DB)
const otpStore = {};

exports.generateOTP = (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  otpStore[email] = { otp, expiresAt: Date.now() + 300000 }; // Valid for 5 minutes
  return otp;
};

exports.sendOTP = async (email) => {
  const otp = exports.generateOTP(email);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}. This code is valid for 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "OTP sent successfully." };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, message: "Failed to send OTP." };
  }
};

exports.verifyOTP = (email, otp) => {
  if (!otpStore[email]) return false;
  if (otpStore[email].expiresAt < Date.now()) {
    delete otpStore[email];
    return false;
  }
  if (otpStore[email].otp !== otp) return false;

  delete otpStore[email];
  return true;
};