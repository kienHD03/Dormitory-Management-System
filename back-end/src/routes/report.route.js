const express = require("express");
const reportController = require("../controllers/report.controller");
const reportRouter = express.Router();

reportRouter.get("/", reportController.getReports); 
reportRouter.get("/:id", reportController.getReportById); 
reportRouter.post("/", reportController.createReport); 
reportRouter.put("/:id", reportController.updateReport); 
reportRouter.delete("/:id", reportController.deleteReport); 

module.exports = reportRouter;
