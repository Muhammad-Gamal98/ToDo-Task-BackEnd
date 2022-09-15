const express = require("express");
const {
  getAllTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  setUserID,
} = require("../Controllers/taskController");
const { protect } = require("../Controllers/authController");

const router = express.Router();

router.use(protect);
router.route("/").get(getAllTasks).post(setUserID, createTask);
router.route("/:id").get(getTask).patch(updateTask).delete(deleteTask);

module.exports = router;
