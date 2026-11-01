const Complaint =
  require("../models/Complaint");

const User =
  require("../models/User");

const Notification =
  require("../models/Notification");

const getAllComplaints =
  async (req, res) => {

    try {

      const complaints =
        await Complaint.find()
          .populate(
            "citizen",
            "name email phone"
          )
          .populate(
            "assignedOfficial",
            "name email"
          )
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

const assignComplaint =
  async (req, res) => {

    try {

      const {
        officialId
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

      const official =
        await User.findOne({
          _id: officialId,
          role: "ADMIN"
        });

      if (!official) {
        return res.status(404).json({
          message:
            "Official not found"
        });
      }

      complaint.assignedOfficial =
        official._id;

      complaint.status =
        "ASSIGNED";

      complaint.history.push({

        status: "ASSIGNED",

        remark:
          `Assigned to ${official.name}`,

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
          "Complaint Assigned",

        message:
          `Your complaint ${complaint.complaintId} has been assigned to an official.`
      });

      res.json({

        message:
          "Complaint assigned",

        complaint

      });

    } catch (error) {

      res.status(500).json({
        message:
          "Assignment failed",

        error:
          error.message
      });
    }
  };

const getOfficials =
  async (req, res) => {

    try {

      const officials =
        await User.find({
          role: "ADMIN"
        })
        .select(
          "name email"
        );

      res.json(
        officials
      );

    } catch (error) {

      res.status(500).json({
        message:
          "Could not fetch officials"
      });
    }
  };

const getAnalytics =
  async (req, res) => {

    try {

      const total =
        await Complaint.countDocuments();

      const resolved =
        await Complaint.countDocuments({
          status: "RESOLVED"
        });

      const inProgress =
        await Complaint.countDocuments({
          status: "IN_PROGRESS"
        });

      const reported =
        await Complaint.countDocuments({
          status: "REPORTED"
        });

      const viewed =
        await Complaint.countDocuments({
          status: "VIEWED"
        });

      const assigned =
        await Complaint.countDocuments({
          status: "ASSIGNED"
        });

      const byCategory =
        await Complaint.aggregate([
          {
            $group: {
              _id: "$category",
              count: {
                $sum: 1
              }
            }
          }
        ]);

      res.json({

        total,
        resolved,
        inProgress,
        reported,
        viewed,
        assigned,
        byCategory

      });

    } catch (error) {

      res.status(500).json({
        message:
          "Could not generate analytics"
      });
    }
  };

module.exports = {
  getAllComplaints,
  assignComplaint,
  getOfficials,
  getAnalytics
};