const Visitor = require("../models/Visitor");
const User = require("../models/User");
const generateQRCode = require("../utils/generateQRcode");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const sendEmail = require("../utils/sendEmail"); // Email Service

// Generate Unique QR Code & Save Visitor Data
exports.inviteVisitor = async (req, res) => {
  try {
      const { name, phone, flat_no, resident_id } = req.body;

      // Check if the resident exists
      const resident = await User.findById(resident_id); // Use User model instead of Resident
      if (!resident) {
          return res.status(404).json({ message: "Resident not found" });
      }

      // Ensure the provided flat_no matches the resident's flat_no
      if (resident.flat_no !== flat_no) {
          return res.status(400).json({ message: "Flat number does not match resident" });
      }

      // Generate a unique QR data string
      const qrData = `${flat_no}-${uuidv4()}`;

      // Generate and store QR code image
      const qrCodePath = `uploads/qrcodes/${qrData}.png`;
      const qrGenerated = await generateQRCode(qrData, qrCodePath);
      if (!qrGenerated) {
          return res.status(500).json({ message: "Failed to generate QR code" });
      }

      // Create a new visitor record
      const newVisitor = new Visitor({
          name,
          phone,
          flat_no,
          resident_id,
          qr_code: qrCodePath, // Store QR code path
      });

      await newVisitor.save();

      res.status(201).json({ message: "Visitor invited successfully", visitor: newVisitor });

  } catch (error) {
      console.error("Error inviting visitor:", error);
      res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Security Guard Scans QR Code
exports.scanQRCode = async (req, res) => {
  try {
      const { qr_code } = req.body;
      const qrCodePath = `uploads/qrcodes/${qr_code}`;

      // Update visitor status
      const updatedVisitor = await Visitor.findOneAndUpdate(
          { qr_code: qrCodePath },
          { $set: { entry_status: "Checked In" } }, // Change status
          { new: true } // Return updated document
      );

      if (!updatedVisitor) {
          return res.status(404).json({ message: "Invalid QR code! Visitor not found." });
      }

      return res.status(200).json({
          message: "QR Code scanned successfully",
          visitor: updatedVisitor
      });

  } catch (error) {
      return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Security Guard Captures Image & Sends to Resident
exports.captureVisitor = async (req, res) => {
  try {
    const { name, phone, flat_no } = req.body;
    const image = req.file ? req.file.path : null; 

    if (!name || !phone || !flat_no || !image) {
      return res.status(400).json({ message: "Missing visitor details or image" });
    }

    // Fetch Resident by Flat Number
    const resident = await User.findOne({ flat_no });
    
    if (!resident) {
      return res.status(400).json({ message: `Flat ${flat_no} does not exist in the society` });
    }

    const resident_id = resident._id;

    // Convert Image Path to a URL
    const serverBaseURL = "http://localhost:5000"; 
    const imageURL = `${serverBaseURL}/${image.replace(/\\/g, "/")}`;

    // Generate QR Code
    const qrCodeData = `${name}-${phone}-${flat_no}-${Date.now()}`;
    const qr_code = await QRCode.toDataURL(qrCodeData);
    
    // Save Visitor with QR Code
    const visitor = new Visitor({
      name,
      phone,
      flat_no,
      resident_id,
      image,
      qr_code, // QR code is now correctly generated and stored
      entry_status: "pending",
    });

    await visitor.save();

    // Send Approval Email to Resident
    const emailOptions = {
      to: resident.email,
      subject: "Visitor Entry Request",
      html: `<p>A visitor is requesting entry to your flat <strong>${flat_no}</strong>.</p>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Phone:</strong> ${phone}</p>
             <p><strong>Visitor Image:</strong><br><img src="${imageURL}" width="300" alt="Visitor Image"/></p>
             <p><a href="http://localhost:5000/api/visitor/approve/${visitor._id}">Approve</a> | 
                <a href="http://localhost:5000/api/visitor/deny/${visitor._id}">❌ Deny</a></p>` 
    };

    await sendEmail(emailOptions);

    res.status(201).json({ 
      message: "Approval request sent to resident!", 
      visitor_id: visitor._id 
    });

  } catch (err) {    
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Resident Approves Visitor
exports.approveVisitor = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the Visitor Entry
    const visitor = await Visitor.findById(id);

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    // Update Visitor Entry Status
    visitor.entry_status = "granted";
    await visitor.save();

    res.status(200).json({ message: "Visitor approved and entry granted", visitor });
  } catch (err) {
    console.error("Approve Visitor Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};




// Mark Visitor Exit
exports.exitVisitor = async (req, res) => {
  try {
    const { id } = req.params;
    const visitor = await Visitor.findById(id);

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found!" });
    }

    visitor.entry_status = "exit";
    visitor.exit_time = new Date();
    await visitor.save();

    res.status(200).json({ message: "Visitor exit recorded!", visitor });

  } catch (err) {
    console.error("Exit Visitor Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Deny Visitor Function
exports.denyVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    visitor.entry_status = "denied";
    await visitor.save();

    res.json({ message: "Visitor denied successfully" });
  } catch (err) {
    console.error("Deny Visitor Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};