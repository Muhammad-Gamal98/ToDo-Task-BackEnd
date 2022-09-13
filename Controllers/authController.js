const User = require("../Model/userModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const signUp = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(201).json({ status: "success", data: user });
});

module.exports = { signUp };
