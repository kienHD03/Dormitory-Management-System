const express = require("express");
const userController = require("../controllers/user.controller");
const userRouter = express.Router();

userRouter.get("/", userController.getUsers);
userRouter.get("/:id/room", userController.getUsersByRoomId);
userRouter.put("/:id", userController.updateUserById);
userRouter.get("/:id", userController.getUserById);
userRouter.delete("/:id", userController.deleteUserById);
userRouter.post("/create", userController.createUser);
userRouter.patch("/:id/role", userController.updateUserRole);
userRouter.patch("/:id/password", userController.updatePassword);
userRouter.delete("/:id/booking", userController.deleteUserBooking);
userRouter.post("/resident-history", userController.createResidentHistory);
userRouter.get("/resident-history/:userId", userController.getResidentHistoryByUserId);

module.exports = userRouter;
