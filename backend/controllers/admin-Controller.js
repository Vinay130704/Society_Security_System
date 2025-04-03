const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const generateUniqueId = require("../utils/generateUniqueId");

exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    if (user.approval_status === "approved") {
      return res.status(400).json({ 
        success: false,
        message: "User already approved" 
      });
    }

    // Generate permanent ID only for residents
    if (user.role === "resident" && !user.permanentId) {
      user.permanentId = await generateUniqueId(User);
    }

    user.approval_status = "approved";
    await user.save();

    try {
      await sendEmail({
        to: user.email,
        subject: "Account Approved",
        html: `
          <p>Dear ${user.name},</p>
          <p>Your account has been approved.</p>
          ${user.permanentId ? `<p>Your permanent ID: ${user.permanentId}</p>` : ''}
        `
      });

      res.status(200).json({ 
        success: true,
        message: "User approved successfully",
        user: {
          id: user._id,
          permanentId: user.permanentId,
          email: user.email
        }
      });
    } catch (emailError) {
      console.error("Email error:", emailError);
      res.status(200).json({ 
        success: true,
        message: "User approved but email failed to send",
        user: {
          id: user._id,
          permanentId: user.permanentId,
          email: user.email
        }
      });
    }
  } catch (err) {
    console.error("Error approving user:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
};

exports.rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { remark } = req.body;

    if (!remark) {
      return res.status(400).json({ 
        success: false,
        message: "Remark is required" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    user.approval_status = "rejected";
    user.remark = remark;
    await user.save();

    try {
      await sendEmail({
        to: user.email,
        subject: "Account Rejected",
        html: `
          <p>Dear ${user.name},</p>
          <p>Your registration has been rejected.</p>
          <p>Reason: ${remark}</p>
        `
      });

      res.status(200).json({ 
        success: true,
        message: "User rejected successfully"
      });
    } catch (emailError) {
      console.error("Email error:", emailError);
      res.status(200).json({ 
        success: true,
        message: "User rejected but email failed to send"
      });
    }
  } catch (err) {
    console.error("Error rejecting user:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ 
      success: true,
      users 
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch users",
      error: err.message 
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { 
      new: true,
      runValidators: true 
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.status(200).json({ 
      success: true,
      message: "User updated successfully",
      user: updatedUser 
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to update user",
      error: err.message 
    });
  }
};

exports.removeResident = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.status(200).json({ 
      success: true,
      message: "User removed successfully" 
    });
  } catch (err) {
    console.error("Error removing user:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to remove user",
      error: err.message 
    });
  }
};