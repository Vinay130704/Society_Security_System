const express = require("express");
const router = express.Router();
const { preApproveDelivery, validateQrCode } = require("../controllers/deliveryController"); // Ensure correct import
const { verifyResident } = require("../middleware/authMiddleware");
  
// ✅ Pre-approve a delivery request (Resident)
router.post("/pre-approve", verifyResident, preApproveDelivery);

// ✅ Security Guard scans QR code
router.post("/scan", validateQrCode);

module.exports = router;
