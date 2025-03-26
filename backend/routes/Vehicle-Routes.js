const express = require("express");
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
router.post("/register/resident", registerPersonalVehicle);

// Visitor Panel - Register Guest Vehicle
router.post("/register/guest", registerGuestVehicle);

// Security Guard Panel - Verify Entry
router.post("/verify/:vehicle_no/:action", verifyVehicleEntry);

// Admin Panel - Block Vehicle
router.put("/block/:vehicle_no", blockVehicle);

// Admin Panel - Unblock Vehicle
router.put("/unblock/:vehicle_no", unblockVehicle);

// Admin Panel - Get All Vehicles
router.get("/all", getAllVehicles);

module.exports = router;
