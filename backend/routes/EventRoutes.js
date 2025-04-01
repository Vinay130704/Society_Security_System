const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const eventController = require("../controllers/EventController");

// Admin-only routes
router.post("/register-event", authMiddleware, eventController.createEvent);
router.put("/update-event/:id", authMiddleware, eventController.updateEvent);
router.delete("/delete-event/:id", authMiddleware, eventController.deleteEvent);

// Resident routes
router.get("/view-event", authMiddleware, eventController.getAllEvents);
router.get("/view-eventby/:id", authMiddleware, eventController.getEventById);
router.post("/register-event/:id", authMiddleware, eventController.registerForEvent);

module.exports = router;