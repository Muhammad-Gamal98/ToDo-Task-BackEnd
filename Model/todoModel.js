const mongoose = require("mongoose");

const todoSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
    },
    description: {
      type: String,
    },
    priority: {
      type: String,
      required: [true, "priority is required"],
      enum: ["High", "Medium", "Low"],
      default: "Low",
    },
    status: {
      type: String,
      required: [true, "status is required"],
      enum: ["TODO", "IN progress", "Under Review", "Rework", "Completed"],
      default: "TODO",
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
const todoModel = mongoose.model("Todo", todoSchema);
module.exports = todoModel;
