const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const {
    registerPersonalVehicle,
    registerGuestVehicle,
    verifyVehicleEntry,
    getAllVehicles,
    blockVehicle,
    unblockVehicle
} = require("../controllers/Vehicle-Controller");

const router = express.Router();

// Resident Panel - Register Personal Vehicle
router.post("/register/resident", authMiddleware,  registerPersonalVehicle);

// Resident Panel - Register Guest Vehicle
router.post("/register/guest", authMiddleware,  registerGuestVehicle);

// Security Guard Panel - Verify Entry
router.post("/verify/:vehicle_no/:action", authMiddleware,  verifyVehicleEntry);

// Admin Panel - Block Vehicle
router.put("/block/:vehicle_no", authMiddleware,  blockVehicle);

// Admin Panel - Unblock Vehicle
router.put("/unblock/:vehicle_no", authMiddleware,  unblockVehicle);

// Admin Panel - Get All Vehicles
router.get("/all", authMiddleware,  getAllVehicles);

module.exports = router;