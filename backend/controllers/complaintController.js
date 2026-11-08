
const Complaint = require("../models/Complaint");
const Notification = require("../models/Notification");
const cloudinary = require("../config/cloudinary");

// Generate unique complaint ID
const generateComplaintId = async () => {
  const count = await Complaint.countDocuments();
  const sequence = String(count + 1).padStart(4, "0");
  const rand = Math.floor(10 + Math.random() * 90);

  return `CIV-${new Date().getFullYear()}-${sequence}${rand}`;
};

// Upload image buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "smart-civic/complaints",
        resource_type: "image"
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
};

// Create complaint
const createComplaint = async (req, res) => {
  let uploadedImage = null;

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
      latitude === undefined ||
      latitude === "" ||
      longitude === undefined ||
      longitude === ""
    ) {
      return res.status(400).json({
        message: "Category and location are required"
      });
    }

    // Upload citizen photograph to Cloudinary
    if (req.file) {
      uploadedImage = await uploadToCloudinary(req.file.buffer);
    }

    const complaintId = await generateComplaintId();

    const complaint = await Complaint.create({
      complaintId,
      citizen: req.user._id,

      image: uploadedImage
        ? uploadedImage.secure_url
        : "",

      cloudinaryPublicId: uploadedImage
        ? uploadedImage.public_id
        : "",

      category,
      issueType,
      description,
      aiDescription,

      severity: (severity || "MEDIUM").toUpperCase(),

      latitude: Number(latitude),
      longitude: Number(longitude),

      address,
      department,
      status: "REPORTED",

      history: [
        {
          status: "REPORTED",
          remark: "Complaint submitted",
          updatedBy: req.user._id
        }
      ]
    });

    return res.status(201).json({
      message: "Complaint submitted successfully",
      complaint
    });

  } catch (error) {
    // Remove uploaded image if complaint creation fails
    if (uploadedImage?.public_id) {
      try {
        await cloudinary.uploader.destroy(uploadedImage.public_id);
      } catch (cleanupError) {
        console.error("Cloudinary cleanup failed:", cleanupError.message);
      }
    }

    console.error("Create complaint error:", error);

    return res.status(500).json({
      message: "Could not create complaint",
      error: error.message
    });
  }
};

// Get complaints submitted by logged-in citizen
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      citizen: req.user._id
    }).sort({
      createdAt: -1
    });

    res.json(complaints);

  } catch (error) {
    console.error("Get my complaints error:", error);

    res.status(500).json({
      message: "Could not fetch complaints"
    });
  }
};

// Get complaint by ID
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("citizen", "name email phone")
      .populate("assignedOfficial", "name email");

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found"
      });
    }

    const isOwner =
      complaint.citizen &&
      complaint.citizen._id.toString() === req.user._id.toString();

    const isStaffOrAdmin =
      req.user.role === "ADMIN" ||
      req.user.role === "STAFF";

    if (!isOwner && !isStaffOrAdmin) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    res.json(complaint);

  } catch (error) {
    console.error("Get complaint error:", error);

    res.status(500).json({
      message: "Could not fetch complaint"
    });
  }
};

// Update complaint status
const updateStatus = async (req, res) => {
  try {
    const { status, remark } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found"
      });
    }

    complaint.status = status;

    if (status === "RESOLVED") {
      complaint.resolvedAt = new Date();
    }

    complaint.history.push({
      status,
      remark: remark || `Status changed to ${status}`,
      updatedBy: req.user._id
    });

    await complaint.save();

    await Notification.create({
      user: complaint.citizen,
      complaint: complaint._id,
      title: "Complaint Status Updated",
      message: `Your complaint ${complaint.complaintId} is now ${status}.`
    });

    res.json({
      message: "Complaint status updated",
      complaint
    });

  } catch (error) {
    console.error("Update status error:", error);

    res.status(500).json({
      message: "Could not update status",
      error: error.message
    });
  }
};

// Delete complaint
const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found"
      });
    }

    const isOwner =
      complaint.citizen.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "Access denied. You can only delete your own complaints."
      });
    }

    await Notification.deleteMany({
      complaint: complaint._id
    });

    await Complaint.findByIdAndDelete(req.params.id);

    // Delete the associated Cloudinary image, if one exists
    if (complaint.cloudinaryPublicId) {
      try {
        const result = await cloudinary.uploader.destroy(
          complaint.cloudinaryPublicId,
          { resource_type: "image" }
        );

        if (result.result !== "ok" && result.result !== "not found") {
          console.warn("Cloudinary image deletion result:", result);
        }
      } catch (imageError) {
        // Complaint is already deleted; log image cleanup failure
        console.error("Cloudinary image deletion failed:", imageError.message);
      }
    }

    res.json({
      message: "Complaint deleted successfully",
      complaintId: complaint.complaintId
    });

  } catch (error) {
    console.error("Delete complaint error:", error);

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
