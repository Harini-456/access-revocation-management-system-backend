const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING"
  },
  adminReply: {
    type: String,
    default: ""
  },
  decisionBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  decisionDate: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model("Request", requestSchema);