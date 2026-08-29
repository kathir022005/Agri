const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "agri-billing-secret-key-2026-super-secure";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User account no longer exists." });
      }

      return next();
    } catch (error) {
      console.error("JWT Auth error:", error.message);
      return res.status(401).json({ message: "Not authorized, invalid token." });
    }
  }

  // Also support token passed in query parameter for direct Excel export links if needed
  if (req.query && req.query.token) {
    try {
      token = req.query.token;
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User account no longer exists." });
      }

      return next();
    } catch (error) {
      console.error("JWT Query Auth error:", error.message);
      return res.status(401).json({ message: "Not authorized, invalid download token." });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided." });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Access denied. Admin privileges required." });
};

module.exports = { protect, adminOnly, JWT_SECRET };
