const express = require("express");
const roomController = require("../controllers/room.controller");
const roomRouter = express.Router();

roomRouter.get("/", roomController.getRooms);
roomRouter.get("/types", roomController.getRoomTypes);
roomRouter.post("/", roomController.createRoom);
roomRouter.patch("/:id", roomController.updateRoom);
roomRouter.post("/booking", roomController.bookingRoom);
roomRouter.put("/expired-date", roomController.updateRoomExpiredDate);
roomRouter.delete("/booking/:userId", roomController.deleteBookingByUserId);

module.exports = roomRouter;
