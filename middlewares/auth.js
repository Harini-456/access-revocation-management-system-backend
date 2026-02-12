const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {

  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({ message: "Authorization missing" });
  }

  try {
    const token = authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.SECRET_CODE);

    req.user = decoded.user;
    next();

  } catch (err) {
    return res.status(401).json({ message: "Token is invalid or expired" });
  }
};
