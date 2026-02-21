const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["EMPLOYEE", "ADMIN"],
    default: "EMPLOYEE"
  },

  status: {
    type: String,
    enum: ["ACTIVE", "REVOKED"],
    default: "ACTIVE"
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
