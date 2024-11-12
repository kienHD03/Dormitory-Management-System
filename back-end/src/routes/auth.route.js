const express = require("express");
const authController = require("../controllers/auth.controller");
const authRouter = express.Router();

authRouter.post("/login", authController.login);
authRouter.post("/google-login", authController.loginWithGoogle);
authRouter.post("/verify", authController.verify);
authRouter.post("/register", authController.register);
authRouter.post("/otp", authController.sendOTP);

module.exports = authRouter;
