const express = require("express");
const multer = require("multer");
const router = express.Router();
const visitorController = require("../controllers/Visitor-Controller");

// File Upload Configuration for Visitor Images
const storage = multer.diskStorage({
  destination: "./uploads/visitor_images/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const visitorUpload = multer({ storage });

// Visitor Invitation (Resident invites visitor)
router.post("/invite", visitorController.inviteVisitor);

// Security Guard Scans QR Code
router.post("/scan", visitorController.scanQRCode);

// Security Guard Captures Image & Sends to Resident for Approval (If no QR)
router.post("/capture", visitorUpload.single("image"), visitorController.captureVisitor);

// Resident Approves Visitor Entry
router.get("/approve/:id", visitorController.approveVisitor);

// Resident Denies Visitor Entry
router.get("/deny/:id", visitorController.denyVisitor);

// Visitor Exit (Security marks visitor exit)
router.post("/exit/:id", visitorController.exitVisitor);

// Admin Panel - Get All Visitor Logs
router.get("/logs", visitorController.getAllVisitorLogs);

// Admin Panel - Get All Visitors Entry Logs (Checked-in, Granted, or Exited)
router.get("/entry-logs", visitorController.getAllEntryLogs);

// Security Guard - Get All Pending Approvals
router.get("/pending-approvals", visitorController.getPendingApprovals);

module.exports = router;
