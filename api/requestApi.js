const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const Request = require("../models/requestsModel");
const User = require("../models/userModel"); 

router.post("/create", auth, async (req, res) => {
  try {
    const { title, description, adminId } = req.body;

    if (!title || !description || !adminId) {
      return res.status(400).json({ message: "Please send all details" });
    }

    // Check if admin exists
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "ADMIN") {
      return res.status(404).json({ message: "Admin not found" });
    }

    const request = new Request({
      requestType: title,      // match your schema
      description,
      status: "PENDING",
      requestedBy: req.user,   // comes from auth middleware
      requestedTo: admin._id
    });

    await request.save();

    return res.status(201).json({ message: "Request created", request });

  } catch (err) {
    console.error("Create request error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get('/revoke-request/myrequests',auth, async(req,res) => {
    const requests = await Request.find({requestedBy: req.user})
    res.json({"requests":requests})
})
router.get('/revoke-request/myPendingrequests', auth,async(req,res) => {
    const requests = await Request.find({requestedBy: req.user,status:"PENDING"})
    res.json({"requests":requests})
})

router.get('/admin/requests', auth, async(req,res) => {
    if (req.role !== "ADMIN") {
        return res.status(403).json({ message: "Access denied" });
    }
    try {
        const requests = await Request.find();
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
})

router.get('/admin/myPendingRequests', auth, async(req,res) => {
     if (req.role !== "ADMIN") {
        return res.status(403).json({ message: "Access denied" });
    }

    const requests = await Request.find({
        requestedTo: req.user,
        status: "PENDING"
    });

    res.json({ requests });
})

router.put('/admin/approve/:id', auth, async (req, res) => {
    if (req.role !== "ADMIN") return res.status(403).json({ message: "Access denied" });

    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.requestedTo.toString() !== req.user.toString())
        return res.status(403).json({ message: "Not assigned to you" });

    request.status = "APPROVED";
    await request.save();

    const user = await User.findById(request.requestedBy);
    user.status = "ACTIVE";
    await user.save();

    res.json({ message: "Request approved, user activated" });
});

router.put('/admin/reject/:id', auth, async (req, res) => {
    if (req.role !== "ADMIN") return res.status(403).json({ message: "Access denied" });

    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.requestedTo.toString() !== req.user.toString())
        return res.status(403).json({ message: "Not assigned to you" });

    request.status = "REJECTED";
    await request.save();

    const user = await User.findById(request.requestedBy);
    user.status = "REJECTED";
    await user.save();

    res.json({ message: "Request rejected, user access revoked" });
});

module.exports = router