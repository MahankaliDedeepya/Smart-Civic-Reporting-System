const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (
  req,
  res,
  next
) => {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const token =
      authHeader.split(" ")[1];

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    const user =
      await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    req.user = user;

    next();

  } catch (error) {

    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

const adminOnly = (
  req,
  res,
  next
) => {

  if (
    !req.user ||
    req.user.role !== "ADMIN"
  ) {
    return res.status(403).json({
      message: "Admin access required"
    });
  }

  next();
};

const staffOrAdmin = (
  req,
  res,
  next
) => {

  if (
    !req.user ||
    (req.user.role !== "ADMIN" && req.user.role !== "STAFF")
  ) {
    return res.status(403).json({
      message: "Official or Staff access required"
    });
  }

  next();
};

module.exports = {
  protect,
  adminOnly,
  staffOrAdmin
};