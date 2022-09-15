const Task = require("../Model/taskModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const setUserID = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
const createTask = factory.createDoc(Task);
const getAllTasks = factory.getAllDoc(Task);
const getTask = factory.getDoc(Task);
const updateTask = factory.updateDoc(Task);
const deleteTask = factory.deleteDoc(Task);

module.exports = {
  createTask,
  getAllTasks,
  getTask,
  updateTask,
  deleteTask,
  setUserID,
};
