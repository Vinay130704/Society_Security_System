const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    name: { 
        type: String, 
        required: true 
    },
    phone: { 
        type: String, 
        required: true 
    },
    flat_no: { 
        type: String, 
        required: true 
    },
    resident_id: {
         type: mongoose.Schema.Types.ObjectId, 
         ref: "Resident", 
         required: true 
        },
    qr_code: { 
        type: String, 
        unique: true, 
        required: true
     },
    image: { 
        type: String 
    }, // Image URL for unregistered visitors
    entry_status: { 
        type: String, 
        enum: ["pending", "granted", "denied"], 
        default: "pending" },
    entry_time: { 
        type: Date
     },
    exit_time: { 
        type: Date 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visitor", visitorSchema);
