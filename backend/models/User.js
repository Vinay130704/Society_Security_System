const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ["admin", "security", "resident"],
      default: "resident",
      required: true
    },
    flat_no: {
      type: String,
      required: function () {
        return this.role === "resident";
      },
      unique: function () {
        return this.role === "resident";
      },
      sparse: true,
      trim: true
    },
    approval_status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: function () {
        return this.role === "admin" ? "approved" : "pending";
      }
    },
    permanentId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    profilePicture: {
      type: String,
      default: ""
    },
    familyMembers: [
      {
        name: String,
        relation: String,
        gender: { type: String, enum: ["male", "female", "-"], default: "-" },
        profilePicture: String
      }
    ]
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);