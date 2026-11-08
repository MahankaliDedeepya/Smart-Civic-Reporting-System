
const express = require("express");
const multer = require("multer");

const {
  protect,
  adminOnly,
  staffOrAdmin
} = require("../middleware/authMiddleware");

const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateStatus,
  deleteComplaint
} = require("../controllers/complaintController");

const router = express.Router();

/* =========================
   MULTER MEMORY STORAGE
========================= */

const storage = multer.memoryStorage();

/* =========================
   IMAGE VALIDATION
========================= */

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only JPG, PNG and WebP images are allowed")
    );
  }
};

/* =========================
   MULTER CONFIGURATION
========================= */

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter
});

/* =========================
   COMPLAINT ROUTES
========================= */

// Create complaint with image upload
router.post(
  "/",
  protect,
  upload.single("image"),
  createComplaint
);

// Get complaints submitted by logged-in citizen
router.get(
  "/my",
  protect,
  getMyComplaints
);

// Get complaint by ID
router.get(
  "/:id",
  protect,
  getComplaintById
);

// Update complaint status
router.put(
  "/:id/status",
  protect,
  staffOrAdmin,
  updateStatus
);

// Delete complaint
router.delete(
  "/:id",
  protect,
  deleteComplaint
);

/* =========================
   MULTER ERROR HANDLER
========================= */

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "Image size must not exceed 5 MB"
      });
    }

    return res.status(400).json({
      message: err.message
    });
  }

  if (
    err.message ===
    "Only JPG, PNG and WebP images are allowed"
  ) {
    return res.status(400).json({
      message: err.message
    });
  }

  next(err);
});

module.exports = router;
