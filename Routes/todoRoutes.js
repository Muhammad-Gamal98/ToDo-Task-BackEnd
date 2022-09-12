const express = require("express");
const { createTask } = require("../Controllers/todoController");
const router = express.Router();

router.route("/").post(createTask);

module.exports = router;
