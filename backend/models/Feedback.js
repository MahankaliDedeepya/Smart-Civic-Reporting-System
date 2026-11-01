const mongoose = require("mongoose");

const feedbackSchema =
  new mongoose.Schema(
    {
      complaint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Complaint",
        required: true,
        unique: true
      },

      citizen: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },

      rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
      },

      comment: {
        type: String,
        default: ""
      }
    },
    {
      timestamps: true
    }
  );

module.exports = mongoose.model(
  "Feedback",
  feedbackSchema
);