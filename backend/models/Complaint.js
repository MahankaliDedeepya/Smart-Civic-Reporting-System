const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true
    },

    remark: {
      type: String,
      default: ""
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    _id: false
  }
);

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
      required: true
    },

    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    image: {
      type: String,
      default: ""
    },

    category: {
      type: String,
      enum: [
        "Roads",
        "Drainage",
        "Garbage",
        "Sanitation",
        "Electricity",
        "Water",
        "Traffic Infrastructure",
        "Public Infrastructure",
        "Other"
      ],
      default: "Other"
    },

    issueType: {
      type: String,
      default: ""
    },

    description: {
      type: String,
      default: ""
    },

    aiDescription: {
      type: String,
      default: ""
    },

    severity: {
      type: String,
      uppercase: true,
      enum: [
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL"
      ],
      default: "MEDIUM"
    },

    latitude: {
      type: Number,
      required: true
    },

    longitude: {
      type: Number,
      required: true
    },

    address: {
      type: String,
      default: ""
    },

    department: {
      type: String,
      default: ""
    },

    assignedOfficial: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    status: {
      type: String,
      enum: [
        "REPORTED",
        "VIEWED",
        "ASSIGNED",
        "IN_PROGRESS",
        "RESOLVED"
      ],
      default: "REPORTED"
    },

    resolutionImage: {
      type: String,
      default: ""
    },

    resolutionRemarks: {
      type: String,
      default: ""
    },

    resolvedAt: {
      type: Date,
      default: null
    },

    history: [historySchema],

    feedback: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feedback",
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Complaint",
  complaintSchema
);