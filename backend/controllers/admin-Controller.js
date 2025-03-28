const mongoose = require("mongoose");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt");

exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.email) {
      return res.status(400).json({ message: "User email is missing." });
    }

    const tempPassword = Math.random().toString(36).slice(-6);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    user.approval_status = "approved";
    user.password = hashedPassword;
    await user.save();

    const emailOptions = {
      to: user.email,
      subject: "Your Account is Approved - Login Details",
      text: `Dear ${user.name},\n\nYour account has been approved.\n\nLogin ID: ${user.email}\nTemporary Password: ${tempPassword}\n\nPlease reset your password after logging in.\n\nBest Regards,\nAdmin Team`,
      html: `
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>Your account has been <strong>approved</strong>. You can now log in.</p>
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
      console.error("Email error:", emailError);
      res.status(500).json({ message: "User approved, but email sending failed.", error: emailError.message });
    }
  } catch (err) {
    console.error("Error approving user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { remark } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    if (!remark || remark.trim() === "") {
      return res.status(400).json({ message: "Remark is required for rejection." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.approval_status = "rejected";
    user.remark = remark;
    await user.save();

    const emailOptions = {
      to: user.email,
      subject: "Your Registration is Rejected",
      text: `Dear ${user.name},\n\nUnfortunately, your registration request has been rejected due to the following reason:\n\n"${remark}"\n\nYou are welcome to register again with the correct details.\n\nBest Regards,\nAdmin Team`,
      html: `
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>Unfortunately, your registration request has been <strong>rejected</strong> due to the following reason:</p>
        <p style="color: red;"><strong>"${remark}"</strong></p>
        <p>You are welcome to <strong>register again</strong> with the correct details.</p>
        <p>Best Regards,<br><strong>Admin Team</strong></p>
      `,
    };

    try {
      await sendEmail(emailOptions);
      res.status(200).json({ message: "User rejected successfully and email sent." });
    } catch (emailError) {
      console.error("Email error:", emailError);
      res.status(500).json({ message: "User rejected, but email sending failed.", error: emailError.message });
    }
  } catch (err) {
    console.error("Error rejecting user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email role flat_no approval_status remark");
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};




// Update user profile (Fixed name)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    // Validate request data
    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!name && !email && !phone) {
      return res.status(400).json({ error: "At least one field (name, email, or phone) is required for update" });
    }

    // Prepare update fields dynamically
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Failed to update user profile", details: error.message });
  }
};




// Remove a resident
exports.removeResident = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User removed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove user" });
  }
};





