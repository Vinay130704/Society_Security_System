const Staff = require("../models/staffModel");
const User = require("../models/User"); // Assuming a User model exists

// Register a new staff member
exports.registerStaff = async (req, res) => {
  try {
    const { name, role, residentId } = req.body;

    // Validate role
    if (!["maid", "driver", "cook"].includes(role)) {
      return res.status(400).json({ message: "Invalid staff role." });
    }

    // Ensure the resident exists
    const resident = await User.findById(residentId);
    if (!resident) {
      return res.status(404).json({ message: "Resident not found." });
    }

    const newStaff = new Staff({ name, role, residentId });
    await newStaff.save();

    res.status(201).json({ message: "Staff registered successfully.", staff: newStaff });
  } catch (error) {
    res.status(500).json({ message: "Error registering staff", error: error.message });
  }
};

// Get all staff members for a specific resident
exports.getResidentStaff = async (req, res) => {
  try {
    const { residentId } = req.params;
    const staff = await Staff.find({ residentId });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: "Error fetching staff", error: error.message });
  }
};

// Block a staff member
exports.blockStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const staff = await Staff.findByIdAndUpdate(staffId, { status: "blocked" }, { new: true });
    if (!staff) return res.status(404).json({ message: "Staff not found." });

    res.json({ message: "Staff blocked successfully.", staff });
  } catch (error) {
    res.status(500).json({ message: "Error blocking staff", error: error.message });
  }
};

// Unblock a staff member
exports.unblockStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const staff = await Staff.findByIdAndUpdate(staffId, { status: "active" }, { new: true });
    if (!staff) return res.status(404).json({ message: "Staff not found." });

    res.json({ message: "Staff unblocked successfully.", staff });
  } catch (error) {
    res.status(500).json({ message: "Error unblocking staff", error: error.message });
  }
};

// Delete a staff member (Cancel ID)
exports.deleteStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const staff = await Staff.findByIdAndDelete(staffId);
    if (!staff) return res.status(404).json({ message: "Staff not found." });

    res.json({ message: "Staff deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting staff", error: error.message });
  }
};
