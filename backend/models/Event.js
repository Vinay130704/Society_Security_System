const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    imageUrl: {
        type: String
    },
    isCancelled: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


// Add pagination plugin
eventSchema.plugin(mongoosePaginate);


// Add index for better query performance
eventSchema.index({ date: 1, isCancelled: 1 });

module.exports = mongoose.model("Event", eventSchema);