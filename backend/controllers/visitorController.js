const multer = require("multer");
const Visitor = require("../models/Visitor");
const nodemailer = require("nodemailer");
const QRCode = require("qrcode");
require("dotenv").config();

// Fix: Add multer definition
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Invite a visitor
exports.inviteVisitor = async (req, res) => {
  try {
    const { name, phone, flat_no, resident_id } = req.body;

    if (!name || !phone || !flat_no || !resident_id) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const qr_code = await QRCode.toDataURL(`${name}-${phone}-${Date.now()}`);

    const visitor = new Visitor({ name, phone, flat_no, resident_id, qr_code });
    await visitor.save();

    res.status(201).json({ message: "Visitor invited successfully", visitor });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Scan QR Code
exports.scanQRCode = async (req, res) => {
    try {
      const { qr_code } = req.body;
  
      // Check if QR exists in DB
      const visitor = await Visitor.findOne({ qr_code });
  
      if (!visitor) {
        return res.status(400).json({ message: "Invalid QR code" });
      }
  
      visitor.entry_status = "granted";
      visitor.entry_time = new Date();
  
      await visitor.save();
  
      res.json({ message: "Entry granted", visitor });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  

// Approve Visitor
exports.approveVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    visitor.entry_status = "granted";
    visitor.entry_time = new Date();
    await visitor.save();

    res.json({ message: "Visitor approved and granted entry", visitor });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Exit Visitor
exports.exitVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    visitor.exit_time = new Date();
    await visitor.save();

    res.json({ message: "Visitor exit recorded", visitor });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


  // Nodemailer transporter for sending emails
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  
  // Capture visitor image
exports.captureVisitor = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }
  
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload_stream(
        { resource_type: "image" },
        async (error, uploadResult) => {
          if (error) return res.status(500).json({ message: "Upload failed", error });
  
          // Save to DB
          const visitor = new Visitor({
            image: uploadResult.secure_url,
            entry_status: "pending"
          });
  
          await visitor.save();
  
          res.json({ message: "Visitor captured", visitor });
        }
      ).end(req.file.buffer);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  

  
// **2. Resident Approves Visitor & Generate QR Code**
exports.approveVisitor = async (req, res) => {
    try {
      const visitor = await Visitor.findById(req.params.id);
      if (!visitor) {
        return res.status(404).json({ success: false, message: "Visitor not found" });
      }
  
      const qrCodeData = `${process.env.BASE_URL}/api/visitors/scan?qr_code=${visitor._id}`;
      const qrCodePath = `uploads/qrcodes/${visitor._id}.png`;
  
      await QRCode.toFile(qrCodePath, qrCodeData);
  
      // Upload QR Code to Cloudinary
      const qrUpload = await cloudinary.uploader.upload(qrCodePath);
  
      visitor.qr_code = qrUpload.secure_url; // Store Cloudinary QR Code URL
      visitor.entry_status = "granted";
      await visitor.save();
  
      // Send QR code to visitor via email
      const mailOptions = {
        from: process.env.EMAIL,
        to: visitor.phone + "@sms.gateway.com", // Replace with actual SMS/email gateway
        subject: "Your QR Code for Entry",
        html: `<p>Your entry has been approved. Show this QR code at the gate.</p>
               <img src="${qrUpload.secure_url}" width="200"/>`
      };
  
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({ success: true, message: "Visitor approved, QR code sent" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error approving visitor", error: error.message });
    }
  };
  
  
  