const mongoose = require("mongoose");
const DeliveryRequest = require("../models/Delivery-Model");
const generateUniqueId = require("../utils/generateUniqueId");
const sendSMS = require("../utils/smsSend");
const User = require("../models/User");

// Helper function to format date for SMS
const formatDateForSMS = (date) => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Create Delivery Request (Resident Only)
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

    // Validate and format phone number
    let formattedPhone = phone;
    if (!phone.startsWith("+")) {
      formattedPhone = `+91${phone}`.replace(/^\+91\+91/, "+91");
    }
    if (!/^\+\d{10,12}$/.test(formattedPhone)) {
      return res.status(400).json({ error: "Invalid phone number format. Use +<country code><10-12 digits>" });
    }

    // Check if a pending request already exists
    let existingDelivery = await DeliveryRequest.findOne({
      residentId,
      status: "pending",
    });

    if (existingDelivery) {
      return res.status(400).json({ error: "A pending delivery request already exists" });
    }

    // Fetch resident details for SMS
    const resident = await User.findById(residentId);
    if (!resident || !resident.name || !resident.flat_no) {
      return res.status(400).json({ error: "Resident details not found or incomplete" });
    }

    // Generate unique ID
    const uniqueId = await generateUniqueId(DeliveryRequest);

    // Create new delivery request
    const newDelivery = new DeliveryRequest({
      residentId: new mongoose.Types.ObjectId(residentId),
      deliveryPersonName,
      phone: formattedPhone,
      apartment,
      deliveryCompany,
      expectedTime,
      uniqueId,
      status: "pending",
    });

    await newDelivery.save();

    // Send SMS to delivery person
    const formattedTime = formatDateForSMS(expectedTime);
    const smsMessage = `Your GuardianNet delivery to ${resident.name} at flat ${resident.flat_no} is scheduled for ${formattedTime}. Entry code: ${uniqueId}`;
    try {
      await sendSMS(formattedPhone, smsMessage);
    } catch (smsError) {
      console.error("Failed to send SMS to delivery person:", smsError);
    }

    res.status(201).json({
      message: "Delivery request created successfully",
      uniqueId,
      delivery: newDelivery
    });

  } catch (error) {
    console.error("Error creating delivery request:", error);
    res.status(500).json({ error: error.message });
  }
};

// Scan Unique ID (Only Security Guards)
const scanUniqueId = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User authentication failed" });
    }

    if (req.user.role !== "security") {
      return res.status(403).json({ error: "Unauthorized: Only security guards can scan codes" });
    }

    const { uniqueId } = req.body;

    const delivery = await DeliveryRequest.findOne({ uniqueId });

    if (!delivery) {
      return res.status(404).json({ error: "Invalid or expired delivery code" });
    }

    if (delivery.status === "completed") {
      return res.status(400).json({ error: "Delivery code already used" });
    }

    delivery.status = "completed";
    delivery.entryTime = new Date();
    await delivery.save();

    // Find resident's phone number
    const resident = await User.findById(delivery.residentId);
    if (resident && resident.phone) {
      const residentMessage = `Your delivery from ${delivery.deliveryCompany} has been completed at ${new Date().toLocaleString()}`;
      try {
        await sendSMS(resident.phone, residentMessage);
      } catch (smsError) {
        console.error("Failed to send SMS to resident:", smsError);
      }
    }

    res.status(200).json({ message: "Delivery code verified successfully", delivery });
  } catch (error) {
    console.error("Error verifying delivery code:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get Delivery Request by ID (Resident Only)
const getDeliveryRequestById = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const userRole = req.user.role;

    if (userRole !== "resident") {
      return res.status(403).json({ error: "Unauthorized: Only residents can view delivery details" });
    }

    if (!mongoose.Types.ObjectId.isValid(deliveryId)) {
      return res.status(400).json({ error: "Invalid deliveryId format" });
    }

    const delivery = await DeliveryRequest.findById(deliveryId);

    if (!delivery) {
      return res.status(404).json({ error: "Delivery request not found" });
    }

    // Ensure the resident can only access their own delivery request
    if (delivery.residentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized: You can only view your own delivery requests" });
    }

    res.status(200).json({
      message: "Delivery request retrieved successfully",
      delivery,
    });
  } catch (error) {
    console.error("Error retrieving delivery request:", error);
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

    // Validate and format phone number if provided
    let formattedPhone = phone;
    if (phone) {
      if (!phone.startsWith("+")) {
        formattedPhone = `+91${phone}`.replace(/^\+91\+91/, "+91");
      }
      if (!/^\+\d{10,12}$/.test(formattedPhone)) {
        return res.status(400).json({ error: "Invalid phone number format. Use +<country code><10-12 digits>" });
      }
    }

    // Fetch resident details for SMS
    const resident = await User.findById(delivery.residentId);
    if (!resident || !resident.name || !resident.flat_no) {
      return res.status(400).json({ error: "Resident details not found or incomplete" });
    }

    // Update delivery details
    Object.assign(delivery, {
      deliveryPersonName: deliveryPersonName || delivery.deliveryPersonName,
      phone: formattedPhone || delivery.phone,
      apartment: apartment || delivery.apartment,
      deliveryCompany: deliveryCompany || delivery.deliveryCompany,
      expectedTime: expectedTime || delivery.expectedTime
    });
    await delivery.save();

    // Send updated SMS to delivery person
    const formattedTime = formatDateForSMS(delivery.expectedTime);
    const smsMessage = `Updated: Your GuardianNet delivery to ${resident.name} at flat ${resident.flat_no} is scheduled for ${formattedTime}. Entry code: ${delivery.uniqueId}`;
    try {
      await sendSMS(delivery.phone, smsMessage);
    } catch (smsError) {
      console.error("Failed to send updated SMS to delivery person:", smsError);
    }

    res.status(200).json({ message: "Delivery details updated successfully", delivery });

  } catch (error) {
    console.error("Error editing delivery details:", error);
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

    // Fetch resident details for SMS
    const resident = await User.findById(delivery.residentId);
    if (!resident || !resident.name || !resident.flat_no) {
      return res.status(400).json({ error: "Resident details not found or incomplete" });
    }

    // Notify delivery person of cancellation
    const smsMessage = `GuardianNet: Delivery to ${resident.name} (flat ${resident.flat_no}) has been cancelled.`;
    try {
      await sendSMS(delivery.phone, smsMessage);
    } catch (smsError) {
      console.error("Failed to send cancellation SMS:", smsError);
    }

    await DeliveryRequest.findByIdAndDelete(deliveryId);

    res.status(200).json({ message: "Delivery request deleted successfully" });

  } catch (error) {
    console.error("Error deleting delivery request:", error);
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
    console.error("Error retrieving delivery requests:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createDeliveryRequest,
  scanUniqueId,
  getDeliveryRequestById,
  editDeliveryDetails,
  deleteDeliveryRequest,
  getAllDeliveryRequests,
};