const express =
  require("express");

const multer =
  require("multer");

const path =
  require("path");

const {
  protect,
  adminOnly,
  staffOrAdmin
} =
  require("../middleware/authMiddleware");

const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateStatus,
  deleteComplaint
} =
  require("../controllers/complaintController");

const router =
  express.Router();

const storage =
  multer.diskStorage({

    destination:
      (req, file, cb) => {

        cb(
          null,
          "uploads/"
        );
      },

    filename:
      (req, file, cb) => {

        const uniqueName =
          Date.now() +
          "-" +
          Math.round(
            Math.random() * 1E9
          ) +
          path.extname(
            file.originalname
          );

        cb(
          null,
          uniqueName
        );
      }
  });

const upload =
  multer({
    storage
  });

router.post(
  "/",
  protect,
  upload.single("image"),
  createComplaint
);

router.get(
  "/my",
  protect,
  getMyComplaints
);

router.get(
  "/:id",
  protect,
  getComplaintById
);

router.put(
  "/:id/status",
  protect,
  staffOrAdmin,
  updateStatus
);

router.delete(
  "/:id",
  protect,
  deleteComplaint
);

module.exports = router;