const Feedback =
  require("../models/Feedback");

const Complaint =
  require("../models/Complaint");

const createFeedback =
  async (req, res) => {

    try {

      const {
        rating,
        comment
      } = req.body;

      const complaint =
        await Complaint.findById(
          req.params.complaintId
        );

      if (!complaint) {
        return res.status(404).json({
          message:
            "Complaint not found"
        });
      }

      if (
        complaint.citizen.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          message:
            "You cannot review this complaint"
        });
      }

      if (
        complaint.status !==
        "RESOLVED"
      ) {
        return res.status(400).json({
          message:
            "Feedback can be submitted after resolution"
        });
      }

      const existing =
        await Feedback.findOne({
          complaint:
            complaint._id
        });

      if (existing) {
        return res.status(409).json({
          message:
            "Feedback already submitted"
        });
      }

      const feedback =
        await Feedback.create({

          complaint:
            complaint._id,

          citizen:
            req.user._id,

          rating:
            Number(rating),

          comment

        });

      complaint.feedback =
        feedback._id;

      await complaint.save();

      res.status(201).json({
        message:
          "Feedback submitted",
        feedback
      });

    } catch (error) {

      res.status(500).json({
        message:
          "Could not submit feedback",

        error:
          error.message
      });
    }
  };

const getAllFeedback =
  async (req, res) => {

    try {

      const feedback =
        await Feedback.find()
          .populate(
            "citizen",
            "name email"
          )
          .populate(
            "complaint",
            "complaintId category"
          )
          .sort({
            createdAt: -1
          });

      res.json(
        feedback
      );

    } catch (error) {

      res.status(500).json({
        message:
          "Could not fetch feedback"
      });
    }
  };

module.exports = {
  createFeedback,
  getAllFeedback
};