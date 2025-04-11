const Visitor = require("../models/Visitor");
const User = require("../models/User");
const generateQRCode = require("../utils/generateQRcode");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const sendEmail = require("../utils/sendEmail");

// Helper function to get server base URL
const getServerBaseUrl = (req) => {
  return `${req.protocol}://${req.get('host')}`;
};

// Generate Unique QR Code & Save Visitor Data
exports.inviteVisitor = async (req, res) => {
  try {
    const { name, phone, flat_no, purpose } = req.body;
    const resident_id = req.user.userId;

    const resident = await User.findById(resident_id);
    if (!resident) {
      return res.status(404).json({ success: false, message: "Resident not found" });
    }
    if (resident.flat_no !== flat_no) {
      return res.status(400).json({ success: false, message: "Flat number doesn't match resident" });
    }

    const qrData = `VISITOR-${flat_no}-${uuidv4()}`;
    const qrCodePath = await generateQRCode(qrData);

    if (!qrCodePath) {
      return res.status(500).json({ success: false, message: "Failed to generate QR code" });
    }

    const visitor = new Visitor({
      name,
      phone,
      flat_no,
      resident_id,
      qr_code: qrData,
      purpose,
      entry_status: "pending",
      is_pre_registered: true
    });

    await visitor.save();

    res.status(201).json({ 
      success: true,
      message: "Visitor invited successfully",
      data: {
        visitor,
        qr_code_url: `${getServerBaseUrl(req)}/api/visitor/qr/${qrData}`
      }
    });

  } catch (error) {
    console.error("Error inviting visitor:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};

// Security Guard Scans QR Code
exports.scanQRCode = async (req, res) => {
  try {
    const { qr_code } = req.body;

    const visitor = await Visitor.findOneAndUpdate(
      { qr_code },
      { $set: { entry_status: "Checked In", entry_time: new Date() } },
      { new: true }
    );

    if (!visitor) {
      return res.status(404).json({ success: false, message: "Invalid QR code! Visitor not found." });
    }

    res.status(200).json({
      success: true,
      message: "QR Code scanned successfully",
      data: visitor
    });

  } catch (error) {
    console.error("QR scan error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};

// Add these new methods to your existing visitorController

// Search visitor by name
exports.searchVisitorByName = async (req, res) => {
  try {
    const { name } = req.body;
    const {flat_no} = req.user;
    
    if (!name) {
      return res.status(400).json({ 
        success: false,
        message: "Name is required" 
      });
    }

    const visitors = await Visitor.find({ 
      name: { $regex: name, $options: 'i' } 
    }).populate("resident_id", "name email flat_no");

    res.status(200).json({
      success: true,
      message: "Visitors found",
      data: visitors
    });

  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};



// Security Guard Captures Image & Sends to Resident
exports.captureVisitor = async (req, res) => {
  try {
    const { name, phone, flat_no, purpose } = req.body;
    const image = req.file?.path;

    if (!name || !phone || !flat_no || !image) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const resident = await User.findOne({ flat_no });
    if (!resident) {
      return res.status(404).json({ success: false, message: "Resident not found" });
    }

    const imageURL = `${getServerBaseUrl(req)}/${image.replace(/\\/g, "/")}`;
    const qrData = `WALKIN-${flat_no}-${uuidv4()}`;
    const qr_code = await QRCode.toDataURL(qrData);

    const visitor = new Visitor({
      name,
      phone,
      flat_no,
      resident_id: resident._id,
      image,
      qr_code,
      purpose,
      entry_status: "pending",
      is_pre_registered: false
    });

    await visitor.save();

    const emailOptions = {
      to: resident.email,
      subject: "Visitor Entry Request",
      html: `<p>A visitor is requesting entry to your flat <strong>${flat_no}</strong>.</p>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Phone:</strong> ${phone}</p>
             <p><strong>Purpose:</strong> ${purpose || 'Not specified'}</p>
             <p><strong>Visitor Image:</strong><br><img src="${imageURL}" width="300" alt="Visitor Image"/></p>
             <p><a href="${getServerBaseUrl(req)}/api/visitor/approve/${visitor._id}">Approve</a> | 
                <a href="${getServerBaseUrl(req)}/api/visitor/deny/${visitor._id}">❌ Deny</a></p>`
    };

    await sendEmail(emailOptions);

    res.status(201).json({ 
      success: true,
      message: "Approval request sent to resident",
      data: { visitor_id: visitor._id }
    });

  } catch (error) {
    console.error("Capture visitor error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};

// Resident Approves Visitor
exports.approveVisitor = async (req, res) => {
  try {
    const { id } = req.params;
    const resident_id = req.user.userId;

    const visitor = await Visitor.findOne({ _id: id, resident_id });
    if (!visitor) {
      return res.status(404).json({ success: false, message: "Visitor not found" });
    }

    visitor.entry_status = "granted";
    await visitor.save();

    res.status(200).json({ 
      success: true,
      message: "Visitor approved successfully",
      data: visitor
    });

  } catch (error) {
    console.error("Approve visitor error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};

// security guard Mark Visitor Exit
exports.exitVisitor = async (req, res) => {
  try {
    const { id } = req.params;

    const visitor = await Visitor.findById(id);
    if (!visitor) {
      return res.status(404).json({ success: false, message: "Visitor not found" });
    }

    if (!["Checked In", "granted"].includes(visitor.entry_status)) {
      return res.status(400).json({ success: false, message: "Visitor has not entered yet" });
    }

    visitor.entry_status = "exit";
    visitor.exit_time = new Date();
    await visitor.save();

    res.status(200).json({ 
      success: true,
      message: "Visitor exit recorded",
      data: visitor
    });

  } catch (error) {
    console.error("Exit visitor error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};

// Resident Denies Visitor
exports.denyVisitor = async (req, res) => {
  try {
    const { id } = req.params;
    const resident_id = req.user.userId;

    const visitor = await Visitor.findOne({ _id: id, resident_id });
    if (!visitor) {
      return res.status(404).json({ success: false, message: "Visitor not found" });
    }

    visitor.entry_status = "denied";
    await visitor.save();

    res.status(200).json({ 
      success: true,
      message: "Visitor denied successfully",
      data: visitor
    });

  } catch (error) {
    console.error("Deny visitor error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};

// Get All Visitor Logs
exports.getAllVisitorLogs = async (req, res) => {
  try {
    const visitors = await Visitor.find().populate("resident_id", "name email flat_no");
    res.status(200).json({ 
      success: true,
      message: "Visitor logs fetched successfully",
      data: visitors
    });
  } catch (error) {
    console.error("Get visitor logs error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};

// Get Entry Logs
exports.getAllEntryLogs = async (req, res) => {
  try {
    const entries = await Visitor.find({ entry_status: { $in: ["Checked In", "granted", "exit"] } })
      .populate("resident_id", "name email flat_no");
    res.status(200).json({ 
      success: true,
      message: "Entry logs fetched successfully",
      data: entries
    });
  } catch (error) {
    console.error("Get entry logs error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};

// Get Pending Approvals
exports.getPendingApprovals = async (req, res) => {
  try {
    const pendingVisitors = await Visitor.find({ entry_status: "pending" })
      .populate("resident_id", "name email flat_no");
    res.status(200).json({ 
      success: true,
      message: "Pending approvals fetched successfully",
      data: pendingVisitors
    });
  } catch (error) {
    console.error("Get pending approvals error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};

// Get QR Code Image
exports.getQRCode = async (req, res) => {
  try {
    const { qr_data } = req.params;
    const qrPath = path.join(__dirname, `../uploads/qrcodes/${qr_data}.png`);

    if (!fs.existsSync(qrPath)) {
      return res.status(404).json({ 
        success: false,
        message: "QR code not found" 
      });
    }

    res.sendFile(qrPath);
  } catch (error) {
    console.error("Get QR code error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};