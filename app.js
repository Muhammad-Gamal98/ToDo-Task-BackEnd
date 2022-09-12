const express = require("express");
const todoRoutes = require("./Routes/todoRoutes");
const app = express();

app.use(express.json());

app.use("/api/v1/todo", todoRoutes);

module.exports = app;
