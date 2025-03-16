const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["admin", "security", "resident"],
      default: "resident"
    },
    flat_no: {
      type: String,
      required: function () {
        return this.role === "resident";
      },
      unique: function () {
        return this.role === "resident"; // ✅ Only enforce uniqueness for residents
      },
      sparse: true
    },
    approval_status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: function () {
        return this.role === "admin" ? "approved" : "pending"; // ✅ Admin auto-approved
      }
    }
  },
  { timestamps: true } // ✅ Correct placement of timestamps
);


// ✅ Remove `flat_no` if the role is not "resident"
userSchema.pre("save", function (next) {
  if (this.role !== "resident") {
    this.flat_no = undefined;
  }
  next();
});

// ✅ Auto-delete unapproved users after 24 hours
userSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 86400, partialFilterExpression: { approval_status: "pending" } }
);

module.exports = mongoose.model("User", userSchema);
