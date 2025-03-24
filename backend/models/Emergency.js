const mongoose = require("mongoose");

const EmergencyAlertSchema = new mongoose.Schema({
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["Fire", "Medical", "Security Threat", "Suspicious Person", "Unauthorized Entry", "Other"],
    required: true,
  },
  customTitle: {
    type: String,
    required: function () {
      return this.type === "Other";
    },
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  photo: {
    type: String, // Optional image URL
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Pending", "Processing", "Resolved"],
    default: "Pending",
  },
  repeatedAttempts: {
    type: Number,
    default: 0, // Used for tracking repeated unauthorized entries
  },
});

module.exports = mongoose.model("EmergencyAlert", EmergencyAlertSchema);
