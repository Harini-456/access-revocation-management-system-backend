const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const User = require("../models/userModel");
const AccessHistory = require("../models/accessHistory");

router.get("/status", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).select("status role email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ status: user.status });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/admin/users", auth, async (req, res) => {
  if (req.role !== "ADMIN")
    return res.status(403).json({ message: "Access denied" });

  try {
    const users = await User.find().select("-password");
    res.json({ users });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/admin/grant/:id", auth, async (req, res) => {
  if (req.role !== "ADMIN")
    return res.status(403).json({ message: "Access denied" });

  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.status = "ACTIVE";
    await user.save();

    // Log history
    await AccessHistory.create({
      userId: user._id,
      action: "GRANTED",
      performedBy: req.user
    });

    res.json({ message: "Access granted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/admin/revoke/:id", auth, async (req, res) => {
  if (req.role !== "ADMIN")
    return res.status(403).json({ message: "Access denied" });

  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.status = "REVOKED";
    await user.save();

    // Log history
    await AccessHistory.create({
      userId: user._id,
      action: "REVOKED",
      performedBy: req.user
    });

    res.json({ message: "Access revoked successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});



router.get("/admin/history", auth, async (req, res) => {
  if (req.role !== "ADMIN")
    return res.status(403).json({ message: "Access denied" });

  try {
    const history = await AccessHistory.find()
      .populate("userId", "name email")
      .populate("performedBy", "name email");

    res.json({ history });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/create", auth, async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Reason is required" });
    }

    const existing = await Request.findOne({
      userId: req.user.id,
      status: "PENDING"
    });

    if (existing) {
      return res.status(400).json({
        message: "You already have a pending request"
      });
    }

    const newRequest = new Request({
      userId: req.user.id,
      reason
    });

    await newRequest.save();

    res.json({ message: "Request submitted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/admin/pending", auth, async (req, res) => {
  try {
    const requests = await Request.find({ status: "PENDING" })
      .populate("userId", "name email");

    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

const Request = require("../models/requestModel");
const User = require("../models/userModel");
const auth = require("../middlewares/auth");

// USER CREATE REQUEST
router.post("/create", auth, async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Reason is required" });
    }

    const existing = await Request.findOne({
      userId: req.user.id,
      status: "PENDING"
    });

    if (existing) {
      return res.status(400).json({
        message: "You already have a pending request"
      });
    }

    const newRequest = new Request({
      userId: req.user.id,
      reason
    });

    await newRequest.save();

    res.json({ message: "Request submitted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ADMIN VIEW PENDING
router.get("/admin/pending", auth, async (req, res) => {
  try {
    const requests = await Request.find({ status: "PENDING" })
      .populate("userId", "name email");

    res.json({ requests });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ADMIN APPROVE
router.put("/admin/approve/:id", auth, async (req, res) => {
  try {
    const { reply } = req.body;

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "APPROVED";
    request.adminReply = reply || "";
    request.decisionBy = req.user.id;
    request.decisionDate = new Date();

    await request.save();

    // Activate user
    await User.findByIdAndUpdate(request.userId, {
      status: "ACTIVE"
    });

    res.json({ message: "Request approved successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ADMIN REJECT
router.put("/admin/reject/:id", auth, async (req, res) => {
  try {
    const { reply } = req.body;

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "REJECTED";
    request.adminReply = reply || "";
    request.decisionBy = req.user.id;
    request.decisionDate = new Date();

    await request.save();

    res.json({ message: "Request rejected successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;