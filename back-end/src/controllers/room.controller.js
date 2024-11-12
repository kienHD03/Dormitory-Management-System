const { updateRoom, getRoomTypes } = require("../models/room");
const roomService = require("../services/room.service");
const { successResponse, errorResponse } = require("../utils/response");

module.exports = {
  getRooms: async (req, res) => {
    try {
      const rooms = await roomService.getRooms();

      return successResponse({
        res,
        message: "Get rooms success",
        data: rooms,
      });
    } catch (error) {
      return errorResponse({
        res,
        status: error.status || 500,
        message: "Get rooms failed",
        errors: error.message,
      });
    }
  },
  createRoom: async (req, res) => {
    try {
      const { roomName, roomTypeName, roomType, departmentName } = req.body;
      // console.log(req.body);
      console.log(roomType == "undefined");
      if (!roomName || roomType == "undefined" || !departmentName || !roomTypeName) {
        const error = new Error("Missing required fields");
        error.status = 400;
        throw error;
      }
      const room = await roomService.createRoom(roomName, roomTypeName, roomType, departmentName);
      return successResponse({
        res,
        message: "Create room success",
        data: room,
      });
    } catch (error) {
      return errorResponse({
        res,
        status: error.status || 500,
        message: "Create room failed",
        errors: error.message,
      });
    }
  },
  updateRoom: async (req, res) => {
    try {
      const { id } = req.params;
      const { roomName, roomTypeName, roomType, departmentName } = req.body;
      if (!roomName || roomType == "undefined" || !departmentName || !roomTypeName || !id) {
        const error = new Error("Missing required fields");
        error.status = 400;
        throw error;
      }
      const room = await roomService.updateRoom(
        roomName,
        roomTypeName,
        roomType,
        departmentName,
        id
      );
      return successResponse({
        res,
        message: "Update room success",
        data: room,
      });
    } catch (error) {
      return errorResponse({
        res,
        status: error.status || 500,
        message: "Update room failed",
        errors: error.message,
      });
    }
  },
  bookingRoom: async (req, res) => {
    try {
      const { userId, roomId, bedId, expiredAt } = req.body;
      if (!userId || !roomId || !bedId || !expiredAt) {
        const error = new Error("Missing required fields");
        error.status = 400;
        throw error;
      }
      const tokens = await roomService.bookingRoom(userId, roomId, bedId, expiredAt);
      return successResponse({
        res,
        message: "Booking room success",
        data: tokens,
      });
    } catch (error) {
      return errorResponse({
        res,
        status: error.status || 500,
        message: "Booking room failed",
        errors: error.message,
      });
    }
  },
  updateRoomExpiredDate: async (req, res) => {
    try {
      console.log("ok");
      const { expiredDate } = req.body;
      if (!expiredDate) {
        const error = new Error("Missing required fields");
        error.status = 400;
        throw error;
      }
      const msg = await roomService.updateRoomExpiredDate(expiredDate);
      return successResponse({
        res,
        message: msg,
      });
    } catch (error) {
      return errorResponse({
        res,
        status: error.status || 500,
        message: "Update room expired date failed",
        errors: error.message,
      });
    }
  },
  getRoomTypes: async (req, res) => {
    try {
      const roomTypes = await roomService.getRoomTypes();
      return successResponse({
        res,
        message: "Get room types success",
        data: roomTypes,
      });
    } catch (error) {
      return errorResponse({
        res,
        status: error.status || 500,
        message: "Get room types failed",
        errors: error.message,
      });
    }
  },
  deleteBookingByUserId: async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        const error = new Error("Missing required fields");
        error.status = 400;
        throw error;
      }
      const msg = await roomService.deleteBookingByUserId(userId);
      return successResponse({
        res,
        message: msg,
      });
    } catch (error) {
      return errorResponse({
        res,
        status: error.status || 500,
        message: "Delete booking failed",
        errors: error.message,
      });
    }
  },
};
