const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User Name is required"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "email is requierd"],
    validate: [validator.isEmail, "Enter a valid email"],
  },
  verified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: [true, "Please Enter password"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please Enter confirm your password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Password Confirm not the Same passowrd",
    },
  },
  passwordChangedAt: Date,
  verifyToken: String,
  verifyTokenExpire: Date,
  passwordResetToken: String,
  passwordResetTokenExpire: Date,
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changePassowrdAfterToken = function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const changeTimeStamp = parseInt(this.passwordChangedAt / 1000, 10);
    return changeTimeStamp > jwtTimeStamp;
  }
  return false;
};
userSchema.methods.createVerifyToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.verifyToken = crypto.createHash("sha256").update(token).digest("hex");
  this.verifyTokenExpire = Date.now() + 30 * 60 * 1000;
  return token;
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetTokenExpire = Date.now() + 30 * 60 * 1000;
  return resetToken;
};
userSchema.methods.checkVerifyExpires = function () {
  if (this.verifyTokenExpire) {
    verifyStamp = parseInt(+this.verifyTokenExpire, 10);
    // console.log(verifyStamp < Date.now());
    return Date.now() > verifyStamp;
  }
};
const User = mongoose.model("User", userSchema);
module.exports = User;
