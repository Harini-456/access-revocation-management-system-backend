const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

module.exports = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({ message: "Authorization missing" });
  }

  try {
    // Extract token from header
    const token = authorization.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET_CODE);

    // Use decoded.id instead of decoded.user
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check user status
    if (user.status !== "ACTIVE") {  // make sure field matches your User model
      return res.status(403).json({ message: "Access revoked" });
    }

    // Attach user info to request
    req.user = user._id;
    req.role = user.role;
    req.status = user.status;

    next();

  } catch (err) {
    return res.status(401).json({ message: "Token is invalid or expired" });
  }
};
