const mongoose = require("mongoose");
const User = require("./User");

const visitorSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    phone: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v) {
          return /^\d{10}$/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
      }
    },
    flat_no: { 
      type: String, 
      required: true,
      uppercase: true
    },
    resident_id: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true
    },
    qr_code: { 
      type: String,
      index: true,
      sparse: true
    },
    image: { 
      type: String 
    },
    purpose: {
      type: String,
      trim: true
    },
    entry_status: { 
      type: String, 
      enum: ["pending", "approved", "rejected", "checked_in", "checked_out"], 
      default: "pending" 
    },
    entry_time: { 
      type: Date
    },
    exit_time: { 
      type: Date 
    },
    is_pre_registered: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
visitorSchema.index({ resident_id: 1 });
visitorSchema.index({ entry_status: 1 });
visitorSchema.index({ flat_no: 1 });

module.exports = mongoose.model("Visitor", visitorSchema);