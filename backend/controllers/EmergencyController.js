const EmergencyAlert = require("../models/Emergency");
const { getIO } = require("../socket");
const { playSoundAlert } = require("../utils/emergencyAlert");

// Resident creates emergency alert
exports.createAlert = async (req, res) => {
  try {
    const { type, customTitle, location, description, photo } = req.body;
    
    if (!type || !location) {
      return res.status(400).json({ message: "Type and location are required" });
    }

    if (type === "Other" && !customTitle) {
      return res.status(400).json({ message: "Custom title is required for 'Other' type" });
    }

    // Handle unauthorized entry tracking
    if (type === "Unauthorized Entry") {
      const existingAlert = await EmergencyAlert.findOne({ 
        type: "Unauthorized Entry", 
        location,
        status: "Pending"
      });

      if (existingAlert) {
        existingAlert.repeatedAttempts += 1;
        existingAlert.description = description || existingAlert.description;
        await existingAlert.save();

        if (existingAlert.repeatedAttempts >= 3) {
          getIO().emit("emergencyAlert", { 
            message: "Multiple unauthorized entries detected!",
            alert: existingAlert
          });
        }
        return res.status(201).json(existingAlert);
      }
    }

    const alert = new EmergencyAlert({
      residentId: req.user.userId,
      type,
      customTitle: type === "Other" ? customTitle : undefined,
      location,
      description,
      photo,
      status: "Pending"
    });

    await alert.save();

    getIO().emit("emergencyAlert", {
      message: "New emergency alert!",
      alert
    });

    playSoundAlert();
    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all alerts (Admin/Security only)
exports.getAllAlerts = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "security") {
      return res.status(403).json({ message: "Access denied" });
    }

    const alerts = await EmergencyAlert.find()
      .populate("residentId", "name email phone flat_no")
      .populate("verifier", "name role") // Populate verifier info
      .sort({ createdAt: -1 });

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get resident's own alerts
exports.getResidentAlerts = async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find({ residentId: req.user.userId })
      .populate("verifier", "name role") // Populate verifier info
      .sort({ createdAt: -1 });
    
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update alert status (Admin/Security only)
exports.updateAlertStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "security") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status, actionTaken } = req.body;
    if (!["Pending", "Processing", "Resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updateData = {
      status,
      actionTaken
    };

    // Track who resolved and when
    if (status === "Resolved") {
      updateData.verifiedBy = req.user.userId;
      updateData.verifiedAt = new Date();
    }

    const alert = await EmergencyAlert.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    .populate("residentId", "name email")
    .populate("verifier", "name role");

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    // Notify resident of status change
    getIO().to(`user_${alert.residentId._id}`).emit("alertUpdate", {
      message: `Your alert has been marked as ${status}`,
      alert: {
        ...alert.toObject(),
        verifiedByName: alert.verifier?.name,
        verifiedByRole: alert.verifier?.role,
        verificationTime: alert.verifiedAt
      }
    });

    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Security triggers unauthorized entry alert
exports.triggerUnauthorizedEntry = async (req, res) => {
  try {
    const { location, description } = req.body;

    if (!location) {
      return res.status(400).json({ message: "Location is required" });
    }

    const alert = new EmergencyAlert({
      residentId: req.user.userId,
      type: "Unauthorized Entry",
      location,
      description: description || "Security reported unauthorized entry",
      status: "Pending"
    });

    await alert.save();

    getIO().emit("emergencyAlert", {
      message: "Unauthorized entry detected!",
      alert
    });

    playSoundAlert();
    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Delete alert (Admin/Security only)
exports.deleteAlert = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "security") {
      return res.status(403).json({ message: "Access denied" });
    }

    const alert = await EmergencyAlert.findByIdAndDelete(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.json({ message: "Alert deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};