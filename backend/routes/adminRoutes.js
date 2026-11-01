const express =
  require("express");

const {
  protect,
  adminOnly,
  staffOrAdmin
} =
  require("../middleware/authMiddleware");

const {
  getAllComplaints,
  assignComplaint,
  getOfficials,
  getAnalytics
} =
  require("../controllers/adminController");

const router =
  express.Router();

router.get(
  "/complaints",
  protect,
  staffOrAdmin,
  getAllComplaints
);

router.put(
  "/complaints/:id/assign",
  protect,
  adminOnly,
  assignComplaint
);

router.get(
  "/officials",
  protect,
  adminOnly,
  getOfficials
);

router.get(
  "/analytics",
  protect,
  staffOrAdmin,
  getAnalytics
);

module.exports = router;