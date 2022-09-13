const jwt = require("jsonwebtoken");
const util = require("util");
const User = require("../Model/userModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const tokenSign = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const sendToken = (user, statusCode, res) => {
  const token = tokenSign(user.id);
  user.password = undefined;
  res.status(statusCode).json({ status: "success", token, data: user });
};

const signUp = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);
  sendToken(user, 201, res);
});
const logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError("Please Enter Email and Password", 400));
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password, user.password)))
    return next(new AppError("Incorect Email or Password", 401));
  sendToken(user, 200, res);
});
const protect = catchAsync(async (req, res, next) => {
  //1- getting the token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new AppError("you are not logged in! please log in to get access", 401)
    );
  }
  //2- verfication token

  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  //3- check if user still exist
  const user = await User.findById(decoded.id);
  if (!user)
    return next(
      AppError("The user belonging to this token does no longer exist.", 401)
    );
  //4-check if user changed password after the token was issued
  if (user.changePassowrdAfterToken(decoded.iat)) {
    return next(
      new AppError("user recently Changed Password! Please logIn again.", 401)
    );
  }
  req.user = user;
  next();
});

module.exports = { signUp, logIn, protect };
