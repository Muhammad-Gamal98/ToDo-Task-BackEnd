const mongoose = require("mongoose");
const validator = require("validator");
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
});
const User = mongoose.model("User", userSchema);
module.exports = User;
