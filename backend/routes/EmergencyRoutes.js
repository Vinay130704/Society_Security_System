const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  createAlert,
  getAllAlerts,
  getResidentAlerts,
  updateAlertStatus,
} = require("../controllers/EmergencyController");

const router = express.Router();

router.post("/create-alert", authMiddleware, createAlert);
router.get("/all-alert", authMiddleware, getAllAlerts); // Admins & Guards see all alerts
router.get("/resident-alert", authMiddleware, getResidentAlerts); // Residents see only their alerts
router.put("/:id/status", authMiddleware, updateAlertStatus);

module.exports = router;
