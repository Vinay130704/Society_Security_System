const Vehicle = require("../models/vehicleModel");
const User = require("../models/User"); // Assuming User data is stored

// Register a vehicle
exports.registerVehicle = async (req, res) => {
    try {
        const { owner_id, flat_no, vehicle_no, vehicle_type } = req.body;

        // Fetch the owner from the database
        const ownerExists = await User.findById(owner_id);

        // Debugging Log: Print the retrieved owner data
        console.log("Owner Data:", ownerExists);

        if (!ownerExists) {
            return res.status(400).json({ message: "Owner ID not found" });
        }

        // Debugging Log: Check flat number comparison
        console.log("Flat No in DB:", ownerExists.flat_no, "| Flat No Input:", flat_no);

        // Check if the flat number matches
        if (ownerExists.flat_no.trim().toLowerCase() !== flat_no.trim().toLowerCase()) {
            return res.status(400).json({ message: "Flat number does not match owner's record" });
        }

        // Check if the vehicle is already registered
        const existingVehicle = await Vehicle.findOne({ vehicle_no });
        if (existingVehicle) {
            return res.status(400).json({ message: "Vehicle already registered" });
        }

        // Register the vehicle
        const newVehicle = new Vehicle({
            owner_id,
            flat_no,
            vehicle_no,
            vehicle_type,
            movement_logs: [],
        });

        await newVehicle.save();
        res.status(201).json({ message: "Vehicle registered successfully", vehicle: newVehicle });

    } catch (error) {
        console.error("Error:", error); // Log error details in the console
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Verify vehicle entry and track movement
exports.verifyVehicleEntry = async (req, res) => {
    try {
        const { vehicle_no, action } = req.params;

        const vehicle = await Vehicle.findOne({ vehicle_no });

        if (!vehicle) {
            return res.status(403).json({ message: "Vehicle not found in the registered records." });
        }

        // Log movement (entry or exit)
        const movement = {
            action: action === "entry" ? "Entered" : "Exited",
            timestamp: new Date(),
        };

        vehicle.movement_logs.push(movement);
        await vehicle.save();

        res.status(200).json({ message: `Vehicle ${movement.action}`, vehicle });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


