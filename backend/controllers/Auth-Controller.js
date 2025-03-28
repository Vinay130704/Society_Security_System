const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendOTP, verifyOTP } = require("../utils/otpSend");

// Register Function
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, flat_no, phone } = req.body;
    console.log("Extracted Data:", { name, email, password, role, flat_no, phone }); 

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email." });
    }

    // **Check if flat number is already assigned to another resident**
    if (role === "resident") {
      const existingFlat = await User.findOne({ flat_no });
      if (existingFlat) {
        return res.status(400).json({ message: "Flat is already registered." });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      flat_no: role === "resident" ? flat_no : null,
      approval_status: "pending" // Ensure approval starts as "pending"
    });

    await newUser.save();

    console.log("Incoming Request Body:", req.body);

    res.status(201).json({
      message: "User registered successfully. Pending admin approval."
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// login function
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if the user is approved
    if (user.approval_status !== "approved") {
      return res.status(403).json({ message: "Your account is not approved yet. Please wait for admin approval." });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    res.status(200).json({ token, role: user.role, message: "Login successful!" });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.requestOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    const otpResponse = await sendOTP(email);
    if (!otpResponse.success) {
      return res.status(500).json({ message: "Error sending OTP." });
    }

    res.json({ message: "OTP sent successfully." });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.changePassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!verifyOTP(email, otp)) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Password changed successfully.", token });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};