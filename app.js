const express = require("express");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cors = require("cors");
const taskRoutes = require("./Routes/taskRoutes");
const userRoutes = require("./Routes/userRoutes");
const ErrorHandler = require("./Error/ErrorController");

const app = express();
<<<<<<< HEAD
app.use(
  cors({
    credentials: true,
    origin: ["http://192.168.1.11:3000", "http://localhost:3000"],
=======
// console.log(process.env.CLIENT);
app.use(
  cors({
    credentials: true,
    origin: [
      "https://todo-task-frontend.herokuapp.com",
      "http://localhost:3000",
      `${process.env.FRONT_URL}`,
    ],
>>>>>>> 5fd51b684c02ffb67bd4aaf40a13b2f945520b66
  })
);
// app.options("http://localhost:3000", cors());
app.use(cookieParser());
app.use(express.json());
app.use((req, res, next) => {
  // console.log("Cookies: ", req.cookies);
  next();
});
app.use(mongoSanitize());
app.use(xss());
console.log(process.env.NODE_ENV);
app.use("/api/v1/task", taskRoutes);
app.use("/api/v1/user", userRoutes);
app.use((req, res, next) => {
  // console.log(req.headers);
  // console.log("Cookies: ", req.cookies);

  next();
});
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

app.use(ErrorHandler);
module.exports = app;
