const util = require("util");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
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
  const cookieOp = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure:false
  };
  if (process.env.NODE_ENV === "production") cookieOp.secure = true;
  console.log(cookieOp.secure)
  res.cookie("jwt", token, cookieOp);
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
  if (!(await User.findById(req.params.id))) {
    return next(new AppError("This user ID not exist", 400));
  }
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
  console.log(req.body);
  console.log(email,password);
  if (!email || !password)
    return next(new AppError("Please Enter Email and Password", 400));
  const user = await User.findOne({ email }).select("+password");
  if (user.verified === false) {
    if (user.checkVerifyExpires()) {
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
        return res.status(201).json({
          status: "success",
          message:
            "Resend verification E-maial, Please verify Your Account via email",
        });
      } catch (error) {
        console.log(error);
        return next(
          new AppError(
            "There was an error sending the email verification!. Please try again.",
            500
          )
        );
      }
    }
    return res
      .status(200)
      .json({ status: "notVerified", message: "please verify your account" });
  }
  if (!user || !(await user.comparePassword(password, user.password)))
    return next(new AppError("Incorect Email or Password", 401));
  sendToken(user, 200, res, { status: "success", data: user });
});
const protect = catchAsync(async (req, res, next) => {
  //1- getting the token and check of it's there
  let token;
  console.log(req.cookies)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }else if(req.cookies.jwt){
    token = req.cookies.jwt
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
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  //4-check if user changed password after the token was issued
  if (user.changePassowrdAfterToken(decoded.iat)) {
    return next(
      new AppError("user recently Changed Password! Please logIn again.", 401)
    );
  }
  req.user = user;
  res.locals.user=user;
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
  )}/api/v1/user/resetpassword/${user._id}/${resetToken}`;
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
    _id: req.params.id,
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
