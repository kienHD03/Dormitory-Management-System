const express = require("express");
const invoiceController = require("../controllers/invoice.controller");
const invoiceRouter = express.Router();

invoiceRouter.get("/", invoiceController.getInvoices);
invoiceRouter.get("/:userId", invoiceController.getInvoiceByUserId);
invoiceRouter.post("/", invoiceController.createInvoice);
invoiceRouter.patch("/:invoiceId", invoiceController.updateInvoiceStatus);

module.exports = invoiceRouter;
