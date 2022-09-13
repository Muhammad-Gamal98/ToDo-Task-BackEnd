const express = require("express");
const authController = require("../Controllers/authController");
const userController = require("../Controllers/userController");
const router = express.Router();

router.post("/signup", authController.signUp);
router.post("/login", authController.logIn);

router.get("/", authController.protect, userController.getAllUsers);

module.exports = router;
