const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided." });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure userId exists
    if (!decoded.userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found in token." });
    }

    req.user = decoded; // Attach user data to request
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

module.exports = { authMiddleware };