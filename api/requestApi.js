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


module.exports = router;