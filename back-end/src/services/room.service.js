const Room = require("../models/room");
const User = require("../models/user");
const { createAccessToken, createRefreshToken } = require("../utils/jwt");

module.exports = {
  getRooms: async () => {
    try {
      const rooms = await Room.getRooms();
      if (rooms.recordsets[0].length === 0) {
        const error = new Error("Rooms not found");
        error.status = 404;
        throw error;
      }
      const [roomsInfo, departments, roomWithPeople, beds] = rooms.recordsets;

      const roomPeopleMap = roomWithPeople.reduce((acc, person) => {
        if (person.room in acc) {
          acc[person.room].push({ email: person.email, bed: person.bed });
        } else {
          acc[person.room] = [{ email: person.email, bed: person.bed }];
        }
        return acc;
      }, {});

      const mergedRooms = roomsInfo.map((room) => {
        const people = roomPeopleMap[room.room] || [];
        return { ...room, people };
      });
      return { roomsInfo, departments, roomWithPeople, mergedRooms, beds };
    } catch (error) {
      throw error;
    }
  },

  createRoom: async (roomName, roomTypeName, roomType, departmentName) => {
    try {
      const room = await Room.createRoom(roomName, roomTypeName, roomType, departmentName);
      if (room.rowsAffected[0] === 0) {
        const error = new Error("Create room failed");
        error.status = 400;
        throw error;
      }
      return room;
    } catch (error) {
      throw error;
    }
  },

  updateRoom: async (roomName, roomTypeName, roomType, departmentName, roomId) => {
    try {
      const room = await Room.updateRoom(roomName, roomTypeName, roomType, departmentName, roomId);
      if (room.rowsAffected[0] === 0) {
        const error = new Error("Update room failed");
        error.status = 400;
        throw error;
      }
      return room;
    } catch (error) {
      throw error;
    }
  },

  bookingRoom: async (userId, roomId, bedId, expiredAt) => {
    try {
      const room = await Room.getRoomById(roomId);

      if (room.recordset.length === 0) {
        const error = new Error("Room not found");
        error.status = 404;
        throw error;
      }
      const isBedExist = room.recordset.some((bed) => bed.bedId === bedId);
      if (isBedExist) {
        const error = new Error("Bed have been booked");
        error.status = 404;
        throw error;
      }

      const isUserExist = room.recordset.some((r) => r.userId === userId);
      if (isUserExist) {
        const error = new Error("User have existed in this room");
        error.status = 404;
        throw error;
      }
      if (room.recordset[0].people_count === room.recordset[0].capacity) {
        const error = new Error("Room is full");
        error.status = 400;
        throw error;
      }
      const booking = await Room.bookingRoom(userId, roomId, bedId, expiredAt);
      if (booking.rowsAffected[0] === 0) {
        const error = new Error("Booking room failed");
        error.status = 400;
        throw error;
      }
      const user = await User.getUserById(userId);
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
  },

  updateRoomExpiredDate: async (expiredDate) => {
    try {
      const room = await Room.updateRoomExpiredDate(expiredDate);
      if (room.rowsAffected[0] === 0) {
        const error = new Error("Update room expired date failed");
        error.status = 400;
        throw error;
      }
      return "Update room expired date successfully";
    } catch (error) {
      throw error;
    }
  },
  getRoomTypes: async () => {
    try {
      const roomTypes = await Room.getRoomTypes();
      if (roomTypes.recordsets[0].length === 0) {
        const error = new Error("Room types not found");
        error.status = 404;
        throw error;
      }
      return roomTypes.recordsets[0];
    } catch (error) {
      throw error;
    }
  },
  deleteBookingByUserId: async (userId) => {
    try {
      const booking = await Room.deleteBookingByUserId(userId);
      if (booking.rowsAffected[0] === 0) {
        const error = new Error("Delete booking failed");
        error.status = 400;
        throw error;
      }
      return "Delete booking successfully";
    } catch (error) {
      throw error;
    }
  },
};
