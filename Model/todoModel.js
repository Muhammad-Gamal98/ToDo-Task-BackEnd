const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
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
      default: Date.now(),
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
const Todo = mongoose.model("Todo", todoSchema);
module.exports = Todo;
