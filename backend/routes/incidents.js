// Placeholder content for routes/incidents.js
const express = require("express");
const router = express.Router();
const incidentController = require("../controllers/incidentController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/report", authMiddleware, incidentController.reportIncident);
router.get("/all", authMiddleware, incidentController.getIncidents);

module.exports = router;
