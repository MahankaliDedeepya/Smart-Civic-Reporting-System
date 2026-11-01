const Notification =
  require("../models/Notification");

const getNotifications =
  async (req, res) => {

    try {

      const notifications =
        await Notification.find({
          user: req.user._id
        })
        .populate(
          "complaint",
          "complaintId"
        )
        .sort({
          createdAt: -1
        });

      res.json(
        notifications
      );

    } catch (error) {

      res.status(500).json({
        message:
          "Could not fetch notifications"
      });
    }
  };

const markAsRead =
  async (req, res) => {

    try {

      const notification =
        await Notification.findOneAndUpdate(

          {
            _id: req.params.id,
            user: req.user._id
          },

          {
            read: true
          },

          {
            new: true
          }
        );

      if (!notification) {
        return res.status(404).json({
          message:
            "Notification not found"
        });
      }

      res.json(
        notification
      );

    } catch (error) {

      res.status(500).json({
        message:
          "Could not update notification"
      });
    }
  };

module.exports = {
  getNotifications,
  markAsRead
};