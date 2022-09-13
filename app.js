const express = require("express");
const todoRoutes = require("./Routes/todoRoutes");
const ErrorHandler = require("./Error/ErrorController");
const app = express();

app.use(express.json());

app.use("/api/v1/todo", todoRoutes);
app.use(ErrorHandler);
module.exports = app;
