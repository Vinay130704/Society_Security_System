const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  createAlert,
  getAllAlerts,
  getResidentAlerts,
  updateAlertStatus,
  triggerUnauthorizedEntry
} = require("../controllers/EmergencyController");

// Resident endpoints
router.post("/", authMiddleware, createAlert);
router.get("/my-alerts", authMiddleware, getResidentAlerts);

// Security endpoints
router.post("/unauthorized-entry", authMiddleware, triggerUnauthorizedEntry);

// Admin/Security endpoints
router.get("/all", authMiddleware, getAllAlerts); // Changed from "/" to "/all"
router.put("/:id/status", authMiddleware, updateAlertStatus);

module.exports = router;