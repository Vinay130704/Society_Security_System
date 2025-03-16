const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "Resident", required: true },
    flat_no: { type: String, required: true },
    vehicle_no: { type: String, unique: true, required: true, match: /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/ },
    vehicle_type: { type: String, enum: ["car", "bike", "scooter"], required: true },
    entry_status: { type: String, enum: ["allowed", "denied"], default: "allowed" },
    movement_logs: [
        {
            action: { type: String, enum: ["Entered", "Exited"], required: true },
            timestamp: { type: Date, default: Date.now },
        },
    ],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
