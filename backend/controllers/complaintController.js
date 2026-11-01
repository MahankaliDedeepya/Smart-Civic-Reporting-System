const Complaint =
  require("../models/Complaint");

const Notification =
  require("../models/Notification");

const generateComplaintId = async () => {
  const count = await Complaint.countDocuments();
  const sequence = String(count + 1).padStart(4, "0");
  const rand = Math.floor(10 + Math.random() * 90);
  return `CIV-${new Date().getFullYear()}-${sequence}${rand}`;
};

const createComplaint =
  async (req, res) => {

    try {

      const {
        category,
        issueType,
        description,
        aiDescription,
        severity,
        latitude,
        longitude,
        address,
        department
      } = req.body;

      if (
        !category ||
        !latitude ||
        !longitude
      ) {
        return res.status(400).json({
          message:
            "Category and location are required"
        });
      }

      const complaintId =
        await generateComplaintId();

      const image =
        req.file
          ? `/uploads/${req.file.filename}`
          : "";

      const complaint =
        await Complaint.create({

          complaintId,

          citizen:
            req.user._id,

          image,

          category,

          issueType,

          description,

          aiDescription,

          severity:
            (severity || "MEDIUM").toUpperCase(),

          latitude:
            Number(latitude),

          longitude:
            Number(longitude),

          address,

          department,

          status: "REPORTED",

          history: [
            {
              status: "REPORTED",

              remark:
                "Complaint submitted",

              updatedBy:
                req.user._id
            }
          ]
        });

      res.status(201).json({

        message:
          "Complaint submitted successfully",

        complaint

      });

    } catch (error) {

      res.status(500).json({
        message:
          "Could not create complaint",

        error:
          error.message
      });
    }
  };

const getMyComplaints =
  async (req, res) => {

    try {

      const complaints =
        await Complaint.find({
          citizen: req.user._id
        })
        .sort({
          createdAt: -1
        });

      res.json(
        complaints
      );

    } catch (error) {

      res.status(500).json({
        message:
          "Could not fetch complaints"
      });
    }
  };

const getComplaintById =
  async (req, res) => {

    try {

      const complaint =
        await Complaint.findById(
          req.params.id
        )
        .populate(
          "citizen",
          "name email phone"
        )
        .populate(
          "assignedOfficial",
          "name email"
        );

      if (!complaint) {
        return res.status(404).json({
          message:
            "Complaint not found"
        });
      }

      const isOwner =
        complaint.citizen &&
        complaint.citizen._id.toString() === req.user._id.toString();

      const isStaffOrAdmin =
        req.user.role === "ADMIN" || req.user.role === "STAFF";

      if (!isOwner && !isStaffOrAdmin) {
        return res.status(403).json({
          message:
            "Access denied"
        });
      }

      res.json(
        complaint
      );

    } catch (error) {

      res.status(500).json({
        message:
          "Could not fetch complaint"
      });
    }
  };

const updateStatus =
  async (req, res) => {

    try {

      const {
        status,
        remark
      } = req.body;

      const complaint =
        await Complaint.findById(
          req.params.id
        );

      if (!complaint) {
        return res.status(404).json({
          message:
            "Complaint not found"
        });
      }

      complaint.status =
        status;

      if (status === "RESOLVED") {
        complaint.resolvedAt =
          new Date();
      }

      complaint.history.push({

        status,

        remark:
          remark ||
          `Status changed to ${status}`,

        updatedBy:
          req.user._id
      });

      await complaint.save();

      await Notification.create({

        user:
          complaint.citizen,

        complaint:
          complaint._id,

        title:
          "Complaint Status Updated",

        message:
          `Your complaint ${complaint.complaintId} is now ${status}.`
      });

      res.json({

        message:
          "Complaint status updated",

        complaint

      });

    } catch (error) {

      res.status(500).json({
        message:
          "Could not update status",

        error:
          error.message
      });
    }
  };

const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found"
      });
    }

    // Verify ownership: only the citizen who created it or an ADMIN can delete
    const isOwner = complaint.citizen.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "Access denied. You can only delete your own complaints."
      });
    }

    // Clean up associated notifications
    await Notification.deleteMany({ complaint: complaint._id });

    // Delete the complaint document
    await Complaint.findByIdAndDelete(req.params.id);

    res.json({
      message: "Complaint deleted successfully",
      complaintId: complaint.complaintId
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not delete complaint",
      error: error.message
    });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateStatus,
  deleteComplaint
};