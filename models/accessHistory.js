const mongoose = require("mongoose");

const accessHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true
 },
  action: { 
    type: String, 
    enum: ["GRANTED", "REVOKED"], 
    required: true 
},
  performedBy: { type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
},
  performedAt: { type: Date, 
    default: Date.now 
}
}, 
{ timestamps: true 
    
});

module.exports = mongoose.model("AccessHistory", accessHistorySchema);
