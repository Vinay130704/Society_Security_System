const User = require("../models/User");
const EntryLog = require("../models/ResidentLogModel");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Configure multer for profile pictures
const profilePicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/profile/";
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile_${Date.now()}${ext}`);
  }
});

const uploadProfilePic = multer({
  storage: profilePicStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    extname && mimetype ? cb(null, true) : cb(new Error("Only images are allowed (JPEG, JPG, PNG)"));
  }
}).single("profilePicture");

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("familyMembers.profilePicture");
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.status(200).json({ 
      success: true,
      user 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};

// Update profile details
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, flat_no } = req.body;
    const userId = req.user.role === 'admin' && req.params.userId ? req.params.userId : req.user._id;

    const updates = { name, email, phone };
    
    // Only update flat_no for residents
    if (req.user.role === "resident" && flat_no) {
      const existingFlat = await User.findOne({ flat_no });
      if (existingFlat && existingFlat._id.toString() !== userId) {
        return res.status(400).json({ 
          success: false,
          message: "Flat number already in use" 
        });
      }
      updates.flat_no = flat_no;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({ 
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: "Update failed",
      error: error.message 
    });
  }
};

// Update profile picture
exports.updateProfilePicture = async (req, res) => {
  uploadProfilePic(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ 
        success: false,
        message: err.message 
      });
    }

    try {
      const userId = req.user.role === 'admin' && req.params.userId ? req.params.userId : req.user._id;
      const user = await User.findById(userId);
      
      // Delete old picture if exists
      if (user.profilePicture && fs.existsSync(user.profilePicture)) {
        fs.unlinkSync(user.profilePicture);
      }

      user.profilePicture = req.file.path.replace(/\\/g, "/");
      await user.save();

      res.status(200).json({ 
        success: true,
        message: "Profile picture updated",
        profilePicture: user.profilePicture
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Failed to update profile picture",
        error: error.message 
      });
    }
  });
};

// Add/Update family member (Resident only)
exports.updateFamilyMember = async (req, res) => {
  try {
    if (req.user.role !== "resident") {
      return res.status(403).json({ 
        success: false,
        message: "Only residents can manage family members" 
      });
    }

    const { memberId, name, relation, gender } = req.body;
    const user = await User.findById(req.user._id);

    if (memberId) {
      // Update existing member
      const memberIndex = user.familyMembers.findIndex(m => m._id == memberId);
      if (memberIndex === -1) {
        return res.status(404).json({ 
          success: false,
          message: "Family member not found" 
        });
      }

      user.familyMembers[memberIndex] = {
        ...user.familyMembers[memberIndex].toObject(),
        name: name || user.familyMembers[memberIndex].name,
        relation: relation || user.familyMembers[memberIndex].relation,
        gender: gender || user.familyMembers[memberIndex].gender
      };
    } else {
      // Add new member
      if (!name || !relation) {
        return res.status(400).json({ 
          success: false,
          message: "Name and relation are required" 
        });
      }
      user.familyMembers.push({
        name,
        relation,
        gender: gender || "other"
      });
    }

    await user.save();
    res.status(200).json({ 
      success: true,
      message: memberId ? "Member updated" : "Member added",
      familyMembers: user.familyMembers
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: "Operation failed",
      error: error.message 
    });
  }
};

// Remove family member (Resident only)
exports.removeFamilyMember = async (req, res) => {
  try {
    if (req.user.role !== "resident") {
      return res.status(403).json({ 
        success: false,
        message: "Only residents can manage family members" 
      });
    }

    const { memberId } = req.params;
    const user = await User.findById(req.user._id);

    const memberIndex = user.familyMembers.findIndex(m => m._id == memberId);
    if (memberIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: "Family member not found" 
      });
    }

    user.familyMembers.splice(memberIndex, 1);
    await user.save();

    res.status(200).json({ 
      success: true,
      message: "Member removed",
      familyMembers: user.familyMembers
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Failed to remove member",
      error: error.message 
    });
  }
};

// Record entry/exit
exports.recordEntryExit = async (req, res) => {
  try {
    const { permanentId, type, method } = req.body;
    
    if (!permanentId || !type || !['entry', 'exit'].includes(type)) {
      return res.status(400).json({ 
        success: false,
        message: "Valid permanent ID and type (entry/exit) required" 
      });
    }

    const user = await User.findOne({ permanentId, role: "resident" });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Resident not found" 
      });
    }

    const log = await EntryLog.create({
      user: user._id,
      permanentId,
      type,
      method: method || "manual",
      verifiedBy: req.user._id,
      personName: user.name
    });

    res.status(201).json({ 
      success: true,
      message: `${type} recorded for ${user.name}`,
      log
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Failed to record log",
      error: error.message 
    });
  }
};

// Get resident logs
exports.getResidentLogs = async (req, res) => {
  try {
    const { permanentId } = req.params;
    const { type, startDate, endDate, limit = 50 } = req.query;

    const query = { permanentId };
    if (type) query.type = type;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await EntryLog.find(query)
      .populate("user", "name flat_no profilePicture")
      .populate("verifiedBy", "name role")
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.status(200).json({ 
      success: true,
      logs 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch logs",
      error: error.message 
    });
  }
};