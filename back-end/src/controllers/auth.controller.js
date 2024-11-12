const authService = require("../services/auth.service");
const { successResponse, errorResponse } = require("../utils/response");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      const error = new Error("Email and password are required");
      error.status = 401;
      throw error;
    }
    const tokens = await authService.login(email, password);
    return successResponse({
      res,
      message: "Login successfully",
      data: tokens,
    });
  } catch (e) {
    return errorResponse({
      res,
      status: e.status || 500,
      message: "Login failed",
      errors: e.message,
    });
  }
};

const registerGoogleAcount = async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) {
      const error = new Error("Email are required");
      error.status = 401;
      throw error;
    }
    const tokens = await authService.registerGoogleAcount(email, name);
    return successResponse({
      res,
      message: "Register successfully",
      data: tokens,
    });
  } catch (e) {
    return errorResponse({
      res,
      status: e.status || 500,
      message: "Register failed",
      errors: e.message,
    });
  }
};

const loginWithGoogle = async (req, res) => {
  try {
    const { email, name, gender } = req.body;
    if (!email) {
      const error = new Error("Email are required");
      error.status = 401;
      throw error;
    }
    const tokens = await authService.loginWithGoogle(email, name, gender);
    return successResponse({
      res,
      message: "Login successfully",
      data: tokens,
    });
  } catch (e) {
    return errorResponse({
      res,
      status: e.status || 500,
      message: "Login failed",
      errors: e.message,
    });
  }
};

const register = async (req, res) => {
  try {
    const { fullname, email, gender, password, role } = req.body;
    if (!fullname || !password || !email || !gender) {
      const error = new Error("Missing required fields");
      error.status = 400;
      throw error;
    }
    const newGender = gender === "male" ? 1 : 0;
    await authService.register(fullname, email, newGender, password, role);
    return successResponse({
      res,
      status: 201,
      message: "User created successfully",
    });
  } catch (e) {
    return errorResponse({
      res,
      status: 500,
      message: "Create user failed",
      errors: e.message,
    });
  }
};

const verify = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      const error = new Error("Email and OTP are required");
      error.status = 400;
      throw error;
    }
    const token = await authService.verifyUser(email, otp);
    return successResponse({
      res,
      message: "Verified successfully",
      data: token,
    });
  } catch (e) {
    return errorResponse({
      res,
      status: e.status,
      message: "Verified failed",
      errors: e.message,
    });
  }
};

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      const error = new Error("Email is required");
      error.status = 400;
      throw error;
    }
    await authService.sendOTP(email);
    return successResponse({
      res,
      message: "Send OTP successfully",
    });
  } catch (error) {
    return errorResponse({
      res,
      status: 500,
      message: "Send OTP failed",
      errors: error.message,
    });
  }
};

module.exports = {
  login,
  register,
  verify,
  sendOTP,
  loginWithGoogle,
};
