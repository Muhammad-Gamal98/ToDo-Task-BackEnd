const Todo = require("../Model/todoModel");

const createTask = async (req, res) => {
  try {
    const task = await Todo.create(
      ({ title, description, priority, status, startDate, startDate } =
        req.body)
    );
    console.log(task);
    res.status(201).json({
      status: "success",
      data: task,
    });
  } catch (error) {
    console.log(error.message);
    console.log("something went wrong");
  }
};
module.exports = { createTask };
