const factory = require("./handlerFactory");
const User = require("../Model/userModel");

exports.getAllUsers = factory.getAllDoc(User);
exports.getUser = factory.getDoc(User);
exports.updateUser = factory.updateDoc(User);
exports.deleteUser = factory.deleteDoc(User);
