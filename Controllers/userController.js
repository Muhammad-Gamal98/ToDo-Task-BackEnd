const factory = require("./handlerFactory");
const User = require("../Model/userModel");

exports.getAllUsers = factory.getAll(User);
