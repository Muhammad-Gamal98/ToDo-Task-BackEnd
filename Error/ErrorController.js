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

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  // console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV === "development") {
    console.log(process.env.NODE_ENV, "pp");
    errorDev(err, req, res);
  }
  next();
};
