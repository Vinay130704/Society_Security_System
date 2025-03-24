const EmergencyAlert = require("../models/Emergency");
const { io } = require("../server");
const { playSoundAlert } = require("../utils/soundAlert");

let ioInstance; 

exports.setIO = (io) => {
  ioInstance = io;
};


// Create an emergency alert (Resident triggers alert)
exports.createAlert = async (req, res) => {
  try {
    const { type, customTitle, location, description, photo } = req.body;

    if (!type || !location) {
      return res.status(400).json({ message: "Type and location are required." });
    }

    // Check if Unauthorized Entry attempt is repeated
    let alert = await EmergencyAlert.findOne({ type: "Unauthorized Entry" });

    if (type === "Unauthorized Entry") {
      if (alert) {
        alert.repeatedAttempts += 1;
        if (alert.repeatedAttempts >= 3) {
          io.emit("emergencyAlert", { message: "Multiple unauthorized entries detected!" });
        }
        await alert.save();
      } else {
        alert = new EmergencyAlert({
          residentId: req.user.userId,
          type,
          location,
          description,
          photo,
          repeatedAttempts: 1,
        });
        await alert.save();
      }
    } else {
      alert = new EmergencyAlert({
        residentId: req.user.userId,
        type,
        customTitle: type === "Other" ? customTitle : null,
        location,
        description,
        photo,
      });
      await alert.save();
    }

    // Play sound for security guard
    playSoundAlert();

    // Send WebSocket notification to security guards and admins
    io.emit("emergencyAlert", { type, location, description });

    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all emergency alerts (Admins & Security Guards)
exports.getAllAlerts = async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find().populate("residentId", "name email");
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get resident's own alerts
exports.getResidentAlerts = async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find({ residentId: req.user.userId });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update alert status (Admins & Security Guards)
exports.updateAlertStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Pending", "Processing", "Resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const alert = await EmergencyAlert.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
