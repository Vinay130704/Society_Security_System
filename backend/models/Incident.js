const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ["Pending", "Resolved"], default: "Pending" },
  alertSent: { type: Boolean, default: false }
});

module.exports = mongoose.model("Incident", incidentSchema);
