const express =
  require("express");

const {
  protect,
  adminOnly
} =
  require("../middleware/authMiddleware");

const {
  createFeedback,
  getAllFeedback
} =
  require("../controllers/feedbackController");

const router =
  express.Router();

router.post(
  "/:complaintId",
  protect,
  createFeedback
);

router.get(
  "/",
  protect,
  adminOnly,
  getAllFeedback
);

module.exports = router;