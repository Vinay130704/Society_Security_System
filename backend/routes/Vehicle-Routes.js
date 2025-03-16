const express = require("express");
const { registerVehicle, verifyVehicleEntry } = require("../controllers/Vehicle-Controller");
const router = express.Router();

router.post("/register", registerVehicle);  // Register a new vehicle
router.post("/verify/:vehicle_no/:action", verifyVehicleEntry);

module.exports = router;
