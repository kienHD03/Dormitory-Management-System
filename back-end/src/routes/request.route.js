const express = require("express");
const requestController = require("../controllers/request.controller");
const requestRouter = express.Router();

requestRouter.get("/", requestController.getRequests); 
requestRouter.get("/:id", requestController.getRequestById); 
requestRouter.post("/", requestController.createRequest); 
requestRouter.put("/:id", requestController.updateRequest); 
requestRouter.delete("/:id", requestController.deleteRequest); 

module.exports = requestRouter;
