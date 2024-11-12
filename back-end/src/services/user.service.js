const User = require("../models/user");
const Room = require("../models/room");
const { createAccessToken, createRefreshToken } = require("../utils/jwt");
const { hashPassword } = require("../utils/hash");

const getUsers = async (req, res) => {
  try {
    const users = await User.getUsers();
    const result = {
      users: users.recordsets[0],
      total: users.recordset.length,
    };
    return result;
  } catch (error) {
    throw error;
  }
};

const getUsersByRoomId = async (id) => {
  try {
    const users = await User.getUsersByRoomId(id);
    const result = {
      users: users.recordsets[0],
      total: users.recordsets[0].length,
    };
    return result;
  } catch (error) {
    throw error;
  }
};

const updateUserById = async (id, fullname, phone, gender) => {
  // const { id } = req.params;
  // const { fullname, phone, gender } = req.body;

  try {
    await User.updateUserById(id, fullname, phone, gender);
    console.log(id, fullname, phone, gender);

    const user = await User.getUserById(id);
    const accessToken = createAccessToken({
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

const getUserById = async (id) => {
  try {
    const user = await User.getUserById(id);
    if (user.recordset.length === 0) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }
    return user.recordset[0];
  } catch (error) {
    throw error;
  }
};

const deleteUserById = async (id) => {
  try {
    if (!id || isNaN(id)) {
      throw new Error("Valid user ID is required");
    }

    const result = await User.deleteUserById(id);

    if (result.affectedRows === 0) {
      throw new Error("User not found or already deleted");
    }

    return { message: "User deleted successfully" };
  } catch (error) {
    throw new Error("Error deleting user: " + error.message);
  }
};

const deleteUserBooking = async (id) => {
  try {
    if (!id || isNaN(id)) {
      throw new Error("Valid user ID is required");
    }

    const result = await User.deleteUserBooking(id);

    if (result.affectedRows === 0) {
      throw new Error("User not found or already deleted");
    }
    return { message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user booking:", error.message);
    throw new Error("Error deleting user: " + error.message);
  }
};

const createUser = async (fullname, email, gender, password, role, phone) => {
  try {
    const user = await User.getUserByEmail(email);
    if (user.recordset.length > 0) {
      throw new Error("Email is already taken");
    }
    const hashedPassword = hashPassword(password);
    await User.createUser(fullname, email, gender, hashedPassword, 1, role, phone);
    const newUser = await User.getUserByEmail(email);

    return newUser.recordset[0];
  } catch (error) {
    throw error;
  }
};

const updateUserRole = async (id, role) => {
  try {
    await User.updateUserRole(id, role);
    return "User role updated successfully";
  } catch (error) {
    throw error;
  }
};

const updateUserBooking = async (id, bed, room) => {
  try {
    await User.updateUserBooking(id, bed, room);
    return "User booking updated successfully";
  } catch (error) {
    throw error;
  }
};

const updatePassword = async (id, newPassword) => {
  try {
    const hashedPassword = hashPassword(newPassword);
    await User.updatePassword(id, hashedPassword);

    return "Đổi mật khẩu thành công";
  } catch (error) {
    throw new Error("Error updating password: " + error.message);
  }
};

const createResidentHistory = async (userId, roomId, bedId, description, expiredAt) => {
  try {
    const roomExpiredDate = await Room.getRoomExpiredDate(roomId);
    if (roomExpiredDate.recordset.length === 0) {
      const error = new Error("Room not found");
      error.status = 404;
      throw error;
    }
    if (expiredAt === 1) {
      await User.createResidentHistory(
        userId,
        roomId,
        bedId,
        description,
        roomExpiredDate.recordset[0].expired_at
      );
      await Room.updateBookingExpiredDate(userId, roomExpiredDate.recordset[0].expired_at);
      const user = await User.getUserById(userId);
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
      return accessToken;
    } else {
      await User.createResidentHistory(userId, roomId, bedId, description, expiredAt);
    }

    return "Resident history created successfully";
  } catch (error) {
    throw error;
  }
};

const getResidentHistoryByUserId = async (userId) => {
  try {
    const residentHistory = await User.getResidentHistoryByUserId(userId);
    if (residentHistory.recordset.length === 0) {
      const error = new Error("Resident history not found");
      error.status = 404;
      throw error;
    }
    return residentHistory.recordset;
  } catch (error) {
    throw error;
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
  updateUserBooking,
  deleteUserBooking,
  createResidentHistory,
  getResidentHistoryByUserId,
};
