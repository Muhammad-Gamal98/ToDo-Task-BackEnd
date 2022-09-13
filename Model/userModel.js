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

const User = mongoose.model("User", userSchema);
module.exports = User;
