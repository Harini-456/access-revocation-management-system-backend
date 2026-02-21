const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

module.exports = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization)
    return res.status(401).json({ message: "Authorization missing" });

  try {
    const token = authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.SECRET_CODE);

    const user = await User.findById(decoded.id);

    if (!user)
      return res.status(401).json({ message: "User not found" });

    if (user.status === "REVOKED")
      return res.status(403).json({ message: "Access revoked by admin" });

    // Set request values
    req.user = user._id;
    req.role = user.role;
    req.status = user.status;  

    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
