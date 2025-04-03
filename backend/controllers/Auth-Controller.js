const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendOTP, verifyOTP } = require("../utils/otpSend");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, flat_no, phone, otp, profilePicture, familyMembers } = req.body;

    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({ 
        success: false,
        message: "All required fields must be provided" 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: "Email already registered" 
      });
    }

    if (role === "resident") {
      if (!flat_no) {
        return res.status(400).json({ 
          success: false,
          message: "Flat number required for residents" 
        });
      }
      const existingFlat = await User.findOne({ flat_no });
      if (existingFlat) {
        return res.status(400).json({ 
          success: false,
          message: "Flat is already registered" 
        });
      }
    }

    if (!otp) {
      try {
        await sendOTP(email);
        return res.json({ 
          success: true,
          message: "OTP sent to email",
          nextStep: "Verify OTP to complete registration"
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Failed to send OTP"
        });
      }
    }

    if (!verifyOTP(email, otp)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid or expired OTP" 
      });
    }

    const newUser = new User({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role,
      phone,
      flat_no: role === "resident" ? flat_no : undefined,
      profilePicture: profilePicture || "",
      familyMembers: familyMembers || [],
      approval_status: role === "admin" ? "approved" : "pending"
    });

    await newUser.save();

    let token = null;
    if (newUser.approval_status === "approved") {
      token = jwt.sign(
        { userId: newUser._id, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
    }

    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: role === "admin" ? "Admin registered" : "Pending approval",
      token,
      user: userResponse
    });

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ 
      success: false,
      message: "Registration failed",
      error: err.message 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password required" 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    if (user.approval_status !== "approved") {
      return res.status(403).json({ 
        success: false,
        message: "Account not approved yet" 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      token,
      user: userResponse,
      message: "Login successful"
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false,
      message: "Login failed" 
    });
  }
};

// Forgot Password - Send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: "Email required" 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    await sendOTP(email);
    res.json({ 
      success: true,
      message: "OTP sent for password reset" 
    });

  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to send OTP" 
    });
  }
};

// Reset Password with OTP
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Email, OTP and new password required" 
      });
    }

    // Verify OTP
    if (!verifyOTP(email, otp)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid or expired OTP" 
      });
    }

    // Update password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Return updated user data without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ 
      success: true,
      user: userResponse,
      message: "Password reset successful" 
    });

  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ 
      success: false,
      message: "Password reset failed" 
    });
  }
};

// Change Password (for authenticated users)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Current and new passwords required" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Current password is incorrect" 
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Return updated user data without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ 
      success: true,
      user: userResponse,
      message: "Password changed successfully" 
    });

  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to change password" 
    });
  }
};

// Verify OTP (generic)
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false,
        message: "Email and OTP required" 
      });
    }

    if (!verifyOTP(email, otp)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid or expired OTP" 
      });
    }

    res.json({ 
      success: true,
      message: "OTP verified successfully" 
    });

  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ 
      success: false,
      message: "OTP verification failed" 
    });
  }
};



