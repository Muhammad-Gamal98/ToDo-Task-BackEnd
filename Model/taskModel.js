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
    type: Number,
    required: [true, "priority is required"],
    enum: {
      values: [1, 2, 3],
      message: "priority must be in 1 for low or 2 for medium or 3 for high",
    },
    default: 3,
  },
  status: {
    type: Number,
    required: [true, "status is required"],
    enum: {
      values: [1, 2, 3, 4, 5],
      message:
        "status is must be 1 for TODO or 2 for IN progress or 3 for Under Review or 4 for Rework or 5 for Completed",
    },
    default: 1,
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
taskSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name email",
  });
  next();
});
const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
