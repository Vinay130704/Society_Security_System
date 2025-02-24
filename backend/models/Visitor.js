const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema({
  name: String,
  phone: String,
  visitDate: { type: Date, default: Date.now },
  purpose: String,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

module.exports = mongoose.model("Visitor", visitorSchema);
