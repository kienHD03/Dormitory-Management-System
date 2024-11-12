const UserService = require("../services/user.service");
const { successResponse, errorResponse } = require("../utils/response");

const getUsers = async (req, res) => {
  try {
    const data = await UserService.getUsers();
    return successResponse({
      res,
      message: "Get users successfully",
      data,
    });
  } catch (error) {
    return errorResponse({
      res,
      message: error.message,
      status: error.status || 500,
      errors: error.message,
    });
  }
};

const getUsersByRoomId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      const error = new Error("Room id is required");
      error.status = 400;
      throw error;
    }
    const data = await UserService.getUsersByRoomId(id);
    return successResponse({
      res,
      message: "Get users by room id successfully",
      data,
    });
  } catch (e) {
    return errorResponse({
      res,
      message: e.message,
      status: e.status || 500,
      errors: e.message,
    });
  }
};

const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, phone, gender } = req.body;

    if (!id) {
      const error = new Error("User id is required");
      error.status = 400;
      throw error;
    }

    const tokens = await UserService.updateUserById(id, fullname, phone, gender);

    return successResponse({
      res,
      message: "User information updated successfully",
      data: tokens,
    });
  } catch (error) {
    return errorResponse({
      res,
      status: error.status || 500,
      message: "Updating user information failed",
      errors: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      const error = new Error("User id is required");
      error.status = 400;
      throw error;
    }
    const data = await UserService.getUserById(id);
    return successResponse({
      res,
      message: "Get user by id successfully",
      data,
    });
  } catch (e) {
    return errorResponse({
      res,
      message: e.message,
      status: e.status || 500,
      errors: e.message,
    });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new Error("User id is required");
    }
    await UserService.deleteUserById(id); // Gọi hàm deleteUserById từ service
    return successResponse({
      res,
      message: "User deleted successfully",
    });
  } catch (error) {
    return errorResponse({
      res,
      message: error.message,
      status: error.status || 500,
      errors: error.message,
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { fullname, email, gender, password, role, phone } = req.body;
    if (!fullname || !password || !email || !gender || !role || !phone) {
      const error = new Error("Missing required fields");
      error.status = 400;
      throw error;
    }
    const newGender = gender === "male" ? 1 : 0;
    const user = await UserService.createUser(fullname, email, newGender, password, role, phone);
    return successResponse({
      res,
      status: 201,
      message: "User created successfully",
      data: { user },
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

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!id || !role) {
      const error = new Error("User id and role are required");
      error.status = 400;
      throw error;
    }

    const msg = await UserService.updateUserRole(id, role);

    return successResponse({
      res,
      message: msg,
    });
  } catch (error) {
    return errorResponse({
      res,
      status: error.status || 500,
      message: "Updating user role failed",
      errors: error.message,
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!id || !newPassword) {
      return res.status(400).json({ message: "User ID và mật khẩu mới là bắt buộc" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
    }

    const result = await UserService.updatePassword(id, newPassword);

    return res.status(200).json({ message: result.message });
  } catch (error) {
    console.error("Lỗi cập nhật mật khẩu:", error);
    return res.status(error.status || 500).json({
      message: "Lỗi khi cập nhật mật khẩu",
      errors: error.message,
    });
  }
};

const createResidentHistory = async (req, res) => {
  try {
    const { userId, roomId, bedId, description, expiredAt } = req.body;
    console.log(userId, roomId, bedId, expiredAt);
    if (!userId || !roomId || !bedId || !expiredAt) {
      const error = new Error("Missing required fields");
      error.status = 400;
      throw error;
    }
    const msg = await UserService.createResidentHistory(
      userId,
      roomId,
      bedId,
      description,
      expiredAt
    );
    return successResponse({
      res,
      message: msg,
      data: msg,
    });
  } catch (error) {
    return errorResponse({
      res,
      status: error.status || 500,

      message: "Create resident history failed",
      errors: error.message,
    });
  }
};

const deleteUserBooking = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new Error("User id is required");
    }

    await UserService.deleteUserBooking(id);
    return successResponse({
      res,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(`Error deleting user booking: ${error.message}`);

    return errorResponse({
      res,
      message: error.message,
      status: error.status || 500,
      errors: error.message,
    });
  }
};

const getResidentHistoryByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      const error = new Error("User id is required");
      error.status = 400;
      throw error;
    }
    const data = await UserService.getResidentHistoryByUserId(userId);
    return successResponse({
      res,
      message: "Get resident history by user id successfully",
      data,
    });
  } catch (e) {
    return errorResponse({
      res,
      message: e.message,
      status: e.status || 500,
      errors: e.message,
    });
  }
};

module.exports = {
  getUsers,
  getUsersByRoomId,
  updateUserById,
  getUserById,
  deleteUserById,
  createUser,
  updateUserRole,
  updatePassword,
  deleteUserBooking,
  createResidentHistory,
  getResidentHistoryByUserId,
};
