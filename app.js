const express = require("express");
const todoRoutes = require("./Routes/todoRoutes");
const userRoutes = require("./Routes/userRoutes");
const ErrorHandler = require("./Error/ErrorController");
const app = express();

app.use(express.json());

app.use("/api/v1/task", todoRoutes);
app.use("/api/v1/user", userRoutes);

app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

app.use(ErrorHandler);
module.exports = app;
