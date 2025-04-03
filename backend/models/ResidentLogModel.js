const mongoose = require("mongoose");

const residentLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  permanentId: { type: String, required: true },
  personName: { type: String, required: true },
  type: { type: String, enum: ["entry", "exit"], required: true },
  method: { type: String, enum: ["manual", "qr", "biometric"], default: "manual" },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("EntryLog", residentLogSchema);