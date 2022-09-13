const Task = require("../Model/todoModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const createTask = catchAsync(async (req, res, next) => {
  const task = await Task.create(
    ({ title, description, priority, status, startDate, startDate } = req.body)
  );
  res.status(201).json({
    status: "success",
    data: task,
  });
});
const getAllTasks = catchAsync(async (req, res, next) => {
  const tasks = await Task.find({});
  if (!tasks) return next(new AppError("No Tasks Found", 404));
  res
    .status(200)
    .json({ status: "success", result: tasks.length, data: tasks });
});
const getTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  if (!task) return next(new AppError("No Task Found", 404));
  res.status(200).json({ status: "success", data: task });
});
const updateTask = catchAsync(async (req, res, next) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!task) return next(new AppError("Task Not Found", 404));
  res.status(200).json({ status: "success", data: task });
});
const deleteTask = catchAsync(async (req, res, next) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return next(new AppError("Task Not Found to delete", 404));
  res.status(204).json({ status: "success" });
});

module.exports = { createTask, getAllTasks, getTask, updateTask, deleteTask };
