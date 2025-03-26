const Staff = require("../models/staffModel");
const User = require("../models/User");
const generateUniqueId = require("../utils/generateUniqueId");

exports.registerStaff = async (req, res) => {
    try {
        const { name, role, residentId, other_role } = req.body;

        if (!["maid", "driver", "cook", "other"].includes(role)) {
            return res.status(400).json({ message: "Invalid staff role." });
        }

        const resident = await User.findById(residentId);
        if (!resident) return res.status(404).json({ message: "Resident not found." });

        // Check for duplicate staff entry
        const existingStaff = await Staff.findOne({ name, role, residentId });
        if (existingStaff) {
            return res.status(400).json({ message: "Staff with this name, role, and resident already exists." });
        }

        const permanentId = await generateUniqueId(Staff); // Pass Staff model
        const newStaff = new Staff({ name, role, residentId, other_role, permanentId });

        await newStaff.save();
        res.status(201).json({ message: "Staff registered successfully.", staff: newStaff });
    } catch (error) {
        res.status(500).json({ message: "Error registering staff", error: error.message });
    }
};


// 2. Get All Staff Members of a Resident
exports.getResidentStaff = async (req, res) => {
    try {
        const { residentId } = req.params;
        const staff = await Staff.find({ residentId });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: "Error fetching staff", error: error.message });
    }
};

// 3. Block a Staff Member with Remark
exports.blockStaff = async (req, res) => {
    try {
        const { staffId } = req.params;
        const { remark } = req.body;

        if (!remark) {
            return res.status(400).json({ message: "Block remark is required." });
        }

        const staff = await Staff.findByIdAndUpdate(
            staffId, 
            { status: "blocked", blockRemark: remark }, 
            { new: true }
        );

        if (!staff) return res.status(404).json({ message: "Staff not found." });

        res.json({ message: "Staff blocked successfully.", staff });
    } catch (error) {
        res.status(500).json({ message: "Error blocking staff", error: error.message });
    }
};

// 4. Unblock a Staff Member (Set status to "active")
exports.unblockStaff = async (req, res) => {
    try {
        const { staffId } = req.params;

        const staff = await Staff.findById(staffId);
        if (!staff) return res.status(404).json({ message: "Staff not found." });

        if (staff.status !== "blocked") {
            return res.status(400).json({ message: "Staff is not blocked." });
        }

        // Update status to "active" and remove the remark
        staff.status = "active";
        staff.blockRemark = "";
        await staff.save();

        res.json({ message: "Staff activated successfully.", staff });
    } catch (error) {
        res.status(500).json({ message: "Error activating staff", error: error.message });
    }
};


// 5. Delete Staff (Cancel Permanent ID)
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

// 6. Verify Permanent ID (For Security Guard Entry)
exports.verifyPermanentId = async (req, res) => {
    try {
        const { permanentId, securityGuardId } = req.params;

        const staff = await Staff.findOne({ permanentId });
        if (!staff) return res.status(404).json({ message: "Invalid Permanent ID." });

        if (staff.status === "blocked") {
            return res.status(403).json({ message: "Entry Denied. Staff is Blocked.", remark: staff.blockRemark });
        }

        const totalEntries = staff.entryLogs.length;
        const totalExits = staff.entryLogs.filter(log => log.exitTime).length;
        const lastLog = staff.entryLogs.length > 0 ? staff.entryLogs[staff.entryLogs.length - 1] : null;
        const isInside = lastLog && !lastLog.exitTime;

        res.json({
            message: "Permanent ID Verified.",
            staff: {
                name: staff.name,
                permanentId: staff.permanentId,
                status: staff.status,
                totalEntries,
                totalExits,
                isInside,
                lastEntryTime: lastLog ? lastLog.entryTime : "No previous entries",
                lastExitTime: lastLog?.exitTime || "Not exited yet"
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error verifying ID", error: error.message });
    }
};

// 7. Staff Entry (Security Guard must be logged in)
exports.staffEntry = async (req, res) => {
  try {
      const { permanentId } = req.body;
      const securityGuardId = req.securityGuardId; // Get from logged-in user

      const staff = await Staff.findOne({ permanentId });
      if (!staff) return res.status(404).json({ message: "Invalid Permanent ID." });

      if (staff.status === "blocked") {
          return res.status(403).json({ message: "Entry Denied. Staff is Blocked.", remark: staff.blockRemark });
      }

      const lastLog = staff.entryLogs.length > 0 ? staff.entryLogs[staff.entryLogs.length - 1] : null;
      if (lastLog && !lastLog.exitTime) {
          return res.status(400).json({ message: "Staff already inside. Exit first before re-entering." });
      }

      const entryLog = { entryTime: new Date(), securityGuard: securityGuardId };
      staff.entryLogs.push(entryLog);
      await staff.save();

      res.json({ message: "Entry Recorded.", entryTime: entryLog.entryTime, staff });
  } catch (error) {
      res.status(500).json({ message: "Error during staff entry", error: error.message });
  }
};

// 8. Staff Exit (Security Guard must be logged in)
exports.staffExit = async (req, res) => {
  try {
      const { permanentId } = req.body;
      const securityGuardId = req.securityGuardId; // Get from logged-in user

      const staff = await Staff.findOne({ permanentId });
      if (!staff) return res.status(404).json({ message: "Invalid Permanent ID." });

      const lastLogIndex = staff.entryLogs.findIndex(log => !log.exitTime);
      if (lastLogIndex === -1) {
          return res.status(400).json({ message: "Staff has not entered or already exited." });
      }

      staff.entryLogs[lastLogIndex].exitTime = new Date();
      staff.entryLogs[lastLogIndex].securityGuard = securityGuardId;
      await staff.save();

      res.json({
          message: "Exit Recorded.",
          entryTime: staff.entryLogs[lastLogIndex].entryTime,
          exitTime: staff.entryLogs[lastLogIndex].exitTime,
          staff
      });
  } catch (error) {
      res.status(500).json({ message: "Error during staff exit", error: error.message });
  }
};


// 9. Get Complete Entry-Exit History for a Staff Member
exports.getStaffHistory = async (req, res) => {
    try {
        const { permanentId } = req.params;

        const staff = await Staff.findOne({ permanentId });
        if (!staff) return res.status(404).json({ message: "Invalid Permanent ID." });

        res.json({ message: "Entry-Exit History Retrieved.", history: staff.entryLogs });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving history", error: error.message });
    }
};
