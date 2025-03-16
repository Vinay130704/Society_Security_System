const DeliveryRequest = require("../models/DeliveryRequest");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");

// ✅ Step 1: Resident Pre-Approves Delivery Request
exports.preApproveDelivery = async (req, res) => {
  try {
    const { deliveryPersonName, phone } = req.body;

    // Generate a unique QR code for one-time entry
    const qrData = uuidv4();
    const qrCodeImage = await QRCode.toDataURL(qrData);

    const newRequest = new DeliveryRequest({
      residentId: req.user.id,
      deliveryPersonName,
      phone,
      qrCodeData: qrData,
      qrCodeImage,
      status: "pending"
    });

    await newRequest.save();

    res.status(201).json({
      message: "Delivery pre-approved successfully.",
      qrCodeImage
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Step 2: Security Guard Scans the QR Code
exports.validateQrCode = async (req, res) => {
  try {
    const { qrCode } = req.body;

    const request = await DeliveryRequest.findOne({ qrCodeData: qrCode });

    if (!request) {
      return res.status(400).json({ message: "Invalid or expired QR code!" });
    }

    await DeliveryRequest.findByIdAndDelete(request._id);

    res.json({ message: "Entry allowed! QR Code is now invalid.", status: "success" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
