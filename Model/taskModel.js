const mongoose = require("mongoose");
const User = require("./userModel");

const taskSchema = new mongoose.Schema({
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
    enum: {
      values: ["High", "Medium", "Low"],
      message: "priority must be in High or Medium or Low",
    },
    default: "Low",
  },
  status: {
    type: String,
    required: [true, "status is required"],
    enum: {
      values: ["TODO", "IN progress", "Under Review", "Rework", "Completed"],
      message:
        "status is must be TODO or IN progress or Under Review or Rework or Completed",
    },
    default: "TODO",
  },
  startDate: {
    type: Date,
    default: Date.now(),
  },
  endDate: {
    type: Date,
    validate: {
      validator: function (val) {
        return val > this.startDate;
      },
      message: "End Date Must be above Start Date ",
    },
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Task must belong to user"],
  },
});
const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
