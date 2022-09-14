const util = require("util");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { findOne, findById } = require("../Model/userModel");
const User = require("../Model/userModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const Email = require("../utils/Email");

const tokenSign = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const sendToken = (user, statusCode, res, sends) => {
  const token = tokenSign(user._id);
  user.password = undefined;
  res.status(statusCode).json({ ...sends, token });
};
const signUp = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);
  const verifyToken = user.createVerifyToken();
  await user.save({ validateBeforeSave: false });
  const verifyURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/user/verifyaccount/${user._id}/${verifyToken}`;
  const message = `Welcome at Todo App, Please verify your account by (get) request to this URL:
   ${verifyURL}
   Thank you for Registrion.`;
  try {
    await new Email(user).sendVerificationEmail(message);
    res.status(201).json({
      status: "success",
      message: "Please verify Your Account via email",
    });
    // sendToken(user, 201, res, {
    //   status: "success",
    //   message: "Please verify Your Account via email",
    // });
  } catch (error) {
    console.log(error);
    await User.findByIdAndDelete(user._id);
    return next(
      new AppError(
        "There was an error sending the email verification!. Please try again.",
        500
      )
    );
  }
});
const verifyAccount = catchAsync(async (req, res, next) => {
  const hashToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  console.log(hashToken);
  const user = await User.findOne({
    _id: req.params.id,
    verifyToken: hashToken,
    verifyTokenExpire: { $gt: Date.now() },
  });
  if (!user) return next(new AppError("Token is Invalied or expired", 400));
  user.verified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpire = undefined;
  await user.save({ validateBeforeSave: false });
  sendToken(user, 200, res, { status: "success", data: user });
});
const logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError("Please Enter Email and Password", 400));
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password, user.password)))
    return next(new AppError("Incorect Email or Password", 401));
  sendToken(user, 200, res, { status: "success", data: user });
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
const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(
      new AppError(
        "This Email dose not exist!, Please Enter the right email",
        404
      )
    );
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  console.log(resetToken);
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/user/resetpassword/${resetToken}`;
  const emailText = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.
  If you didn't forget your password, please ignore this email!`;
  try {
    await new Email(user).sendPasswordReset(emailText);
    res
      .status(200)
      .json({ status: "success", message: "Reset Token Sent to email" });
  } catch (error) {
    console.log(error);
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpire = undefined;
    user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
});
const resetPassword = catchAsync(async (req, res, next) => {
  const hashToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  console.log(hashToken);
  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetTokenExpire: { $gt: Date.now() },
  });
  if (!user) return next(new AppError("Token is Invalied or expired", 400));
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpire = undefined;
  await user.save();
  sendToken(user, 200, res, { status: "success", data: user });
});
module.exports = {
  signUp,
  logIn,
  protect,
  forgotPassword,
  resetPassword,
  verifyAccount,
};
