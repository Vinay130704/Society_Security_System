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
    type: String, // URL to stored image
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
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model("EmergencyAlert", EmergencyAlertSchema);