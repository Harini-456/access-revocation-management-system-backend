const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

module.exports = async (req, res, next) => {
  // Allow preflight requests
  if (req.method === "OPTIONS") return next();

  try {
    const authorization = req.headers.authorization;

    // Check if header exists
    if (!authorization) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    // Check Bearer format
    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const token = authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET_CODE);
    

    // Find user in DB
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Allow only ACTIVE users
    if (user.status !== "ACTIVE") {
      return res.status(403).json({ message: "Access revoked or pending" });
    }

    // Attach user info to request
    req.user = user._id;
    req.role = user.role;
    req.status = user.status;

    next();

  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};