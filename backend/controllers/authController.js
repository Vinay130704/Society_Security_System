const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ Register Function
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, flat, phone } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email." });
    }

    // Check if the flat number is already assigned to another resident
    if (role === "resident") {
      if (!flat) {
        return res.status(400).json({ message: "Flat number is required for residents." });
      }
      const existingFlat = await User.findOne({ flat_no: flat });
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
      flat_no: role === "resident" ? flat : null,
      approval_status: "pending" // Ensure approval starts as "pending"
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully. Pending admin approval."
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ✅ Login Function
exports.login = async (req, res) => {
  try {
      const { email, password } = req.body;

      if (!email || !password) {
          return res.status(400).json({ message: "Email and password are required." });
      }

      const user = await User.findOne({ email });
      if (!user) {
          return res.status(401).json({ message: "Invalid email or password." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(401).json({ message: "Invalid email or password." });
      }

      // ✅ Generate JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

      // ✅ Log the response before sending
      const response = { message: "Login successful!", token };
      console.log("Login Response:", response);

      // ✅ Send response
      res.status(200).json(response);
  } catch (err) {
      console.error("Login Error:", err);
      res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};



// Change Password Function
exports.changePassword = async (req, res) => {
  try {
      console.log("Request User:", req.user); 

      if (!req.user || !req.user.userId) {
          return res.status(401).json({ message: "Unauthorized: No user ID found in token." });
      }

      const { userId } = req.user;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
          return res.status(400).json({ message: "Both old and new passwords are required." });
      }

      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({ message: "User not found in database." });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
          return res.status(400).json({ message: "Old password is incorrect." });
      }

      // ✅ Hash the new password and save
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      // ✅ Generate a new JWT token after password change
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

      res.json({ message: "Password changed successfully.", token });
  } catch (err) {
      console.error("Error changing password:", err); // ✅ Logs the actual error for debugging
      res.status(500).json({ message: "Server error", error: err.message });
  }
};
