const express = require("express");
const router = express.Router();
const visitorController = require("../controllers/Visitor-Controller");
const { authMiddleware } = require("../middleware/authMiddleware");
const multer = require("multer");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/visitor_images/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Resident routes
router.post("/invite", authMiddleware, visitorController.inviteVisitor);
router.get("/approve/:id", authMiddleware, visitorController.approveVisitor);
router.get("/deny/:id", authMiddleware, visitorController.denyVisitor);

// Security routes
router.post("/scan", authMiddleware, visitorController.scanQRCode);
router.post("/capture", upload.single('image'), visitorController.captureVisitor);
router.post("/exit/:id", authMiddleware, visitorController.exitVisitor);
router.post("/search-by-name", authMiddleware, visitorController.searchVisitorByName);

// Admin/Reporting routes
router.get("/logs", authMiddleware, visitorController.getAllVisitorLogs);
router.get("/entry-logs", authMiddleware, visitorController.getAllEntryLogs);
router.get("/pending-approvals", authMiddleware, visitorController.getPendingApprovals);

// Public routes
router.get("/qr/:qr_data", visitorController.getQRCode);

module.exports = router;