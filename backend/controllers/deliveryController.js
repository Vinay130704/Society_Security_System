const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const DeliveryRequest = require("../models/Delivery-Model");
const generateQRCode = require("../utils/generateQRcode");

// Create Delivery Request (Only Residents)
const createDeliveryRequest = async (req, res) => {
  try {
    const { residentId, deliveryPersonName, phone, apartment, deliveryCompany, expectedTime } = req.body;
    const userRole = req.user.role;

    if (userRole !== "resident") {
      return res.status(403).json({ error: "Unauthorized: Only residents can create delivery requests" });
    }

    if (!mongoose.Types.ObjectId.isValid(residentId)) {
      return res.status(400).json({ error: "Invalid residentId format" });
    }

    // Check if a pending request already exists
    let existingDelivery = await DeliveryRequest.findOne({
      residentId,
      status: "pending",
    });

    if (existingDelivery) {
      return res.status(400).json({ error: "A pending delivery request already exists" });
    }

    // Generate unique QR data
    const qrData = `${apartment}-${deliveryCompany}-${uuidv4()}`;

    // Generate and store QR code image
    const qrCodePath = `uploads/qrcodes/${qrData}.png`;
    const qrGenerated = await generateQRCode(qrData, qrCodePath);
    if (!qrGenerated) {
      return res.status(500).json({ message: "Failed to generate QR code" });
    }

    // Create new delivery request
    const newDelivery = new DeliveryRequest({
      residentId: new mongoose.Types.ObjectId(residentId),
      deliveryPersonName,
      phone,
      apartment,
      deliveryCompany,
      expectedTime,
      qrCode: qrCodePath, // ✅ FIXED: Use qrCodePath
      status: "pending",
    });

    await newDelivery.save();

    res.status(201).json({
      message: "Delivery request created successfully",
      qrCode: qrCodePath, // ✅ Return correct QR code path
    });

  } catch (error) {
    console.error("Error creating delivery request:", error);
    res.status(500).json({ error: error.message });
  }
  
};

// Scan QR Code (Only Security Guards)
const scanQrCode = async (req, res) => {
  try {
    console.log("Request Received:", req.body);
    console.log("User Role:", req.user?.role);

    if (!req.user) {
      return res.status(401).json({ error: "User authentication failed" });
    }

    if (req.user.role !== "security") {
      return res.status(403).json({ error: "Unauthorized: Only security guards can scan QR codes" });
    }

    let { qrCode } = req.body; // Extract qrCode from request
    console.log("Scanning QR Code:", qrCode);

    // Ensure the query matches how the QR code is stored in DB
    const qrCodePath = `uploads/qrcodes/${qrCode}`;
    
    console.log("Searching for QR Code Path in DB:", qrCodePath);

    const delivery = await DeliveryRequest.findOne({ qrCode: qrCodePath });

    console.log("Found Delivery Request:", delivery);

    if (!delivery) {
      return res.status(404).json({ error: "Invalid or expired QR code" });
    }

    if (delivery.status === "completed") {
      return res.status(400).json({ error: "QR code already scanned and completed" });
    }

    delivery.status = "completed";
    delivery.entryTime = new Date();
    await delivery.save();

    res.status(200).json({ message: "QR scanned successfully", delivery });
  } catch (error) {
    console.error("Error scanning QR:", error);
    res.status(500).json({ error: error.message });
  }
};


// Edit Delivery Details (Resident Only)
const editDeliveryDetails = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { deliveryPersonName, phone, apartment, deliveryCompany, expectedTime } = req.body;
    const userRole = req.user.role;

    if (userRole !== "resident") {
      return res.status(403).json({ error: "Unauthorized: Only residents can edit delivery details" });
    }

    const delivery = await DeliveryRequest.findById(deliveryId);

    if (!delivery) {
      return res.status(404).json({ error: "Delivery request not found" });
    }

    if (new Date(delivery.expectedTime) < new Date()) {
      return res.status(403).json({ error: "Cannot edit: Delivery time has passed" });
    }

    Object.assign(delivery, { deliveryPersonName, phone, apartment, deliveryCompany, expectedTime });
    await delivery.save();

    res.status(200).json({ message: "Delivery details updated successfully", delivery });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Delivery Request (Resident Only)
const deleteDeliveryRequest = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const userRole = req.user.role;

    if (userRole !== "resident") {
      return res.status(403).json({ error: "Unauthorized: Only residents can delete delivery requests" });
    }

    const delivery = await DeliveryRequest.findById(deliveryId);

    if (!delivery) {
      return res.status(404).json({ error: "Delivery request not found" });
    }

    if (new Date(delivery.expectedTime) < new Date()) {
      return res.status(403).json({ error: "Cannot delete: Delivery time has passed" });
    }

    await DeliveryRequest.findByIdAndDelete(deliveryId);

    res.status(200).json({ message: "Delivery request deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Delivery Requests
const getAllDeliveryRequests = async (req, res) => {
  try {
    const { status } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const deliveries = await DeliveryRequest.find(query).sort({ createdAt: -1 });

    if (!deliveries.length) {
      return res.status(404).json({ message: "No matching delivery requests found" });
    }

    res.status(200).json({
      message: "Delivery requests retrieved successfully",
      deliveries,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createDeliveryRequest,
  scanQrCode,
  editDeliveryDetails,
  deleteDeliveryRequest,
  getAllDeliveryRequests,
};


