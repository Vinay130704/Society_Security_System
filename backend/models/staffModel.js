const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["maid", "driver", "cook"],
        required: true
    },
    residentId: {
        type: mongoose.Schema.Types.ObjectId, ref: "User", required: true
    },
    status: {
        type: String,
        enum: ["active", "blocked"],
        default: "active"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model("Staff", staffSchema);
