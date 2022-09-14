const express = require("express");
const authController = require("../Controllers/authController");
const userController = require("../Controllers/userController");
const router = express.Router();

router.get("/", authController.protect, userController.getAllUsers);

router.post("/signup", authController.signUp);
router.get("/verifyaccount/:id/:token", authController.verifyAccount);
router.post("/login", authController.logIn);
router.post("/forgotpassword", authController.forgotPassword);
router.post("/forgotpassword", authController.forgotPassword);
router.patch("/resetpassword/:id/:token", authController.resetPassword);

module.exports = router;
