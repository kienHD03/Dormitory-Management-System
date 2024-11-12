const e = require("express");
const User = require("../models/user");
const { hashPassword, comparePassword } = require("../utils/hash");
const { createAccessToken, createRefreshToken } = require("../utils/jwt");
const sendMail = require("../utils/mail");

const sendVerifyEmail = async (email, otp) => {
  await sendMail(
    `${email}`,
    "Xác thực tài khoản",
    `<h2>Mã xác thực của bạn là: <b>${otp}</b> (Có hiệu lực trong 60 giây)</h2>`
  );
};

const generateOTP = () => {
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10); // Tạo ra số ngẫu nhiên từ 0 đến 9
  }
  return otp;
};

const login = async (email, password) => {
  try {
    const user = await User.getUserByEmail(email);
    if (user.recordset.length === 0) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }
    if (!comparePassword(password, user.recordset[0].password)) {
      const error = new Error("Wrong password");
      error.status = 401;
      throw error;
    }
    if (user.recordset[0].status === 0) {
      const otp = generateOTP();
      const verifiedUser = await User.checkAccountVerified(email);
      if (verifiedUser.recordset.length === 0) {
        await User.createUserOtp(user.recordset[0].id, otp);
        await sendVerifyEmail(email, otp);
      } else {
        await User.updateUserOTP(email, otp);
        await sendVerifyEmail(email, otp);
      }
    }
    const accessToken = createAccessToken({
      id: user.recordset[0].id,
      fullname: user.recordset[0].fullname,
      email: user.recordset[0].email,
      phone: user.recordset[0].phone,
      status: user.recordset[0].status,
      gender: user.recordset[0].gender,
      roomId: user.recordset[0].room_id,
      room: user.recordset[0].room,
      bedId: user.recordset[0].bed_id,
      bed: user.recordset[0].bed,
      role: user.recordset[0].role,
      department: user.recordset[0].department,
      expired_at: user.recordset[0].expired_at,
    });
    const refreshToken = createRefreshToken({
      id: user.recordset[0].id,
      fullname: user.recordset[0].fullname,
      email: user.recordset[0].email,
      phone: user.recordset[0].phone,
      status: user.recordset[0].status,
      gender: user.recordset[0].gender,
      room: user.recordset[0].room,
      bed: user.recordset[0].bed,
      role: user.recordset[0].role,
      department: user.recordset[0].department,
      expired_at: user.recordset[0].expired_at,
    });
    return { accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
};

const loginWithGoogle = async (email, fullname, gender) => {
  try {
    const existedUser = await User.getUserByEmail(email);
    if (existedUser.recordset.length === 0) {
      await User.createUser(fullname, email, gender, null, 1, 4);
    }

    const user = await User.getUserByEmail(email);
    if (user.recordset.length === 0) {
      const error = new Error("Register failed");
      error.status = 500;
      throw error;
    }

    if (user.recordset[0].status === 0) {
      await User.updateUserStatus(email);
    }

    const registeredUser = await User.getUserByEmail(email);

    const accessToken = createAccessToken({
      id: registeredUser.recordset[0].id,
      fullname: registeredUser.recordset[0].fullname,
      email: registeredUser.recordset[0].email,
      phone: registeredUser.recordset[0].phone,
      status: registeredUser.recordset[0].status,
      gender: registeredUser.recordset[0].gender,
      roomId: registeredUser.recordset[0].room_id,
      room: registeredUser.recordset[0].room,
      bedId: registeredUser.recordset[0].bed_id,
      bed: registeredUser.recordset[0].bed,
      role: registeredUser.recordset[0].role,
      department: registeredUser.recordset[0].department,
      expired_at: registeredUser.recordset[0].expired_at,
    });
    const refreshToken = createRefreshToken({
      id: registeredUser.recordset[0].id,
      fullname: registeredUser.recordset[0].fullname,
      email: registeredUser.recordset[0].email,
      phone: registeredUser.recordset[0].phone,
      status: registeredUser.recordset[0].status,
      gender: registeredUser.recordset[0].gender,
      room: registeredUser.recordset[0].room,
      role: registeredUser.recordset[0].role,
      department: registeredUser.recordset[0].department,
      expired_at: registeredUser.recordset[0].expired_at,
    });

    return { accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
};

const register = async (fullname, email, gender, password, role) => {
  try {
    const user = await User.getUserByEmail(email);
    if (user.recordset.length > 0) {
      throw new Error("Email is already taken");
    }
    const hashedPassword = hashPassword(password);
    const newUser = await User.createUser(fullname, email, gender, hashedPassword, 0, role);

    return newUser;
  } catch (error) {
    throw error;
  }
};

const sendOTP = async (email) => {
  try {
    const verifiedUser = await User.checkAccountVerified(email);
    const otp = generateOTP();
    if (verifiedUser.recordset.length === 0) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }
    await sendVerifyEmail(email, otp);
    await User.updateUserOTP(email, otp);
  } catch (error) {
    throw error;
  }
};

const verifyUser = async (email, otp) => {
  try {
    const user = await User.checkAccountVerified(email);
    const currentTimeUTC = new Date();
    const timezoneOffset = 7;
    const currentTimeGMT7 = new Date(currentTimeUTC.getTime() + timezoneOffset * 60 * 60 * 1000);
    const expiredTime = new Date(user.recordset[0].expired_at);

    if (!user) {
      throw new Error("User not found");
    }
    if (user.recordset[0].otp !== otp) {
      const error = new Error("Invalid OTP");
      error.status = 400;
      throw error;
    }

    if (currentTimeGMT7 > expiredTime) {
      const error = new Error("OTP expired");
      error.status = 400;
      throw error;
    }

    await User.updateUserStatus(email);

    const newUser = await User.getUserByEmail(email);

    const accessToken = createAccessToken({
      id: newUser.recordset[0].id,
      fullname: newUser.recordset[0].fullname,
      email: newUser.recordset[0].email,
      phone: newUser.recordset[0].phone,
      status: newUser.recordset[0].status,
      gender: newUser.recordset[0].gender,
      roomId: newUser.recordset[0].room_id,
      room: newUser.recordset[0].room,
      bedId: newUser.recordset[0].bed_id,
      bed: newUser.recordset[0].bed,
      role: newUser.recordset[0].role,
      department: newUser.recordset[0].department,
      expired_at: newUser.recordset[0].expired_at,
    });
    return accessToken;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  login,
  register,
  verifyUser,
  sendOTP,
  loginWithGoogle,
};
