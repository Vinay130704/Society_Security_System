const Vehicle = require("../models/vehicleModel");
const User = require("../models/User");
const Visitor = require("../models/Visitor");

// Register Resident's Personal Vehicle (Permanent)
exports.registerPersonalVehicle = async (req, res) => {
    try {
        const { flat_no, vehicle_no, vehicle_type } = req.body;
        const owner_id = req.user.userId; // Get from authenticated user

        // Check if the owner exists (Resident)
        const owner = await User.findById(owner_id);
        if (!owner) {
            return res.status(400).json({ message: "Resident not found" });
        }

        // Ensure the resident's flat number matches
        if (owner.flat_no.trim().toLowerCase() !== flat_no.trim().toLowerCase()) {
            return res.status(400).json({ message: "Flat number does not match owner's record" });
        }

        // Check if the vehicle is already registered
        const existingVehicle = await Vehicle.findOne({ vehicle_no });
        if (existingVehicle) {
            return res.status(400).json({ message: "Vehicle already registered" });
        }

        // Register the personal vehicle as permanent
        const newVehicle = new Vehicle({
            owner_id,
            ownerType: "Self",
            flat_no,
            vehicle_no,
            vehicle_type,
            is_guest: false,
            entry_status: "allowed",
            movement_logs: [],
        });

        await newVehicle.save();
        res.status(201).json({ message: "Resident vehicle registered successfully", vehicle: newVehicle });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Register Guest Vehicle (Visitor Panel)
exports.registerGuestVehicle = async (req, res) => {
    try {
        const { visitor_id, vehicle_no, vehicle_type } = req.body;
        const resident_id = req.user.userId; // Resident who is registering visitor's vehicle

        // Verify resident exists
        const resident = await User.findById(resident_id);
        if (!resident) {
            return res.status(400).json({ message: "Resident not found" });
        }

        // Check if the visitor exists and belongs to resident's flat
        const visitor = await Visitor.findOne({
            _id: visitor_id,
            resident_id: resident_id
        });

        if (!visitor) {
            return res.status(400).json({ message: "Visitor not found or not associated with your flat" });
        }

        // Check if the vehicle is already registered
        const existingVehicle = await Vehicle.findOne({ vehicle_no });
        if (existingVehicle) {
            return res.status(400).json({ message: "Vehicle already registered" });
        }

        // Register the guest vehicle
        const newVehicle = new Vehicle({
            owner_id: visitor_id,
            ownerType: "Visitor",
            flat_no: resident.flat_no,
            vehicle_no,
            vehicle_type,
            is_guest: true,
            entry_status: "allowed",
            movement_logs: [],
        });

        await newVehicle.save();
        res.status(201).json({ message: "Guest vehicle registered successfully", vehicle: newVehicle });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Verify Vehicle Entry (Security Guard Panel)
exports.verifyVehicleEntry = async (req, res) => {
    try {
        const { vehicle_no, action } = req.params;

        // Validate action
        if (!["entry", "exit"].includes(action)) {
            return res.status(400).json({ message: "Invalid action. Use 'entry' or 'exit'" });
        }

        // Find vehicle
        let vehicle = await Vehicle.findOne({ vehicle_no }).populate("owner_id");

        if (!vehicle) {
            return res.status(403).json({ message: "Vehicle not found in registered records." });
        }

        // Blocked vehicles cannot enter
        if (vehicle.entry_status === "denied" && action === "entry") {
            return res.status(403).json({ message: "Vehicle is blocked. Entry not allowed." });
        }

        // Check last movement log
        const lastLog = vehicle.movement_logs.length > 0
            ? vehicle.movement_logs[vehicle.movement_logs.length - 1].action
            : null;

        // Restriction: Entry allowed only if last action was "Exited" OR it's the first time entry
        if (action === "entry" && lastLog !== "Exited" && lastLog !== null) {
            return res.status(403).json({ message: "Vehicle must exit before entering again." });
        }

        // Restriction: Exit allowed only if last action was "Entered"
        if (action === "exit" && lastLog !== "Entered") {
            return res.status(403).json({ message: "Vehicle must enter before exiting." });
        }

        // Log vehicle entry/exit
        const status = action === "entry" ? "Entered" : "Exited";
        vehicle.movement_logs.push({ action: status, timestamp: new Date() });

        await vehicle.save();
        res.status(200).json({ message: `Vehicle ${status} recorded`, vehicle });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Block a vehicle (Admin Panel)
exports.blockVehicle = async (req, res) => {
    try {
        const { vehicle_no } = req.params;
        let vehicle = await Vehicle.findOne({ vehicle_no });

        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        vehicle.entry_status = "denied";
        await vehicle.save();

        res.status(200).json({ message: "Vehicle blocked successfully", vehicle });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Unblock a vehicle (Admin Panel)
exports.unblockVehicle = async (req, res) => {
    try {
        const { vehicle_no } = req.params;
        let vehicle = await Vehicle.findOne({ vehicle_no });

        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        vehicle.entry_status = "allowed";
        await vehicle.save();

        res.status(200).json({ message: "Vehicle unblocked successfully", vehicle });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Get all vehicles (Admin Panel)
exports.getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find()
            .populate({
                path: 'owner_id',
                select: 'name email phone'
            });
        res.status(200).json({ vehicles });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};