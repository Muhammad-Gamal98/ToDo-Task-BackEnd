const AppError = require("../utils/AppError");

const errorDev = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }
};
const errorProduction = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    console.log("Error", err);
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
};
const handelJWTExpiredError = () => {
  return new AppError("Your token has expired! Please log in again.", 401);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  // console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV === "development") {
    console.log(process.env.NODE_ENV, "pp");
    errorDev(err, req, res);
  }
  if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    console.log(error);
    if (err.name === "TokenExpiredError") error = handelJWTExpiredError();
    errorProduction(error, req, res);
  }
  next();
};
