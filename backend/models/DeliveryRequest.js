const mongoose = require("mongoose");

const DeliveryRequestSchema = new mongoose.Schema({
  residentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  deliveryPersonName: { type: String, required: true },
  phone: { type: String, required: true },
  qrCodeData: { type: String, unique: true, required: true },
  qrCodeImage: { type: String, required: true },
  status: { type: String, enum: ["pending", "used"], default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("DeliveryRequest", DeliveryRequestSchema);
