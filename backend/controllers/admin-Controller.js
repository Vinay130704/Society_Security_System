const mongoose = require("mongoose");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt");

exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the user has an email
    if (!user.email) {
      return res.status(400).json({ message: "User email is missing. Cannot send approval email." });
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-6); // Random 8-character password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Update approval status and password
    user.approval_status = "approved";
    user.password = hashedPassword;
    await user.save();

    // Send approval email with login details
    const emailOptions = {
      to: user.email,
      subject: "Your Account is Approved - Login Details",
      text: `Dear ${user.name},

Congratulations! Your account has been approved. You can now log in.

**Login ID:** ${user.email}
**Temporary Password:** ${tempPassword}

Please reset your password after logging in.

Best Regards,
Admin Team`,
      html: `
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>Congratulations! Your account has been <strong>approved</strong>. You can now log in.</p>
        <p><strong>Login ID:</strong> ${user.email}</p>
        <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        <p><strong>Please reset your password</strong> after logging in.</p>
        <p>Best Regards,<br><strong>Admin Team</strong></p>
      `,
    };

    try {
      await sendEmail(emailOptions);
      res.status(200).json({ message: "User approved successfully and email sent." });
    } catch (emailError) {
      res.status(500).json({ message: "User approved, but email sending failed.", error: emailError.message });
    }

  } catch (err) {
    console.error("Error approving user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
