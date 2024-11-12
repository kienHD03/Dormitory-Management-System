const { getInvoices, updateInvoiceStatus } = require("../models/invoice");
const InvoiceService = require("../services/invoice.service");
const { errorResponse, successResponse } = require("../utils/response");

module.exports = {
  getInvoices: async (req, res) => {
    try {
      const invoices = await InvoiceService.getInvoices();
      return successResponse({
        res,
        message: "Get invoices successfully",
        data: invoices,
      });
    } catch (error) {
      return errorResponse({
        res,
        message: "Get invoices failed",
        status: error.status || 500,
        errors: error.message,
      });
    }
  },
  getInvoiceByUserId: async (req, res) => {
    try {
      const { userId } = req.params;
      const invoices = await InvoiceService.getInvoiceByUserId(userId);
      return successResponse({
        res,
        message: "Get invoices by user id successfully",
        data: invoices,
      });
    } catch (error) {
      return errorResponse({
        res,
        message: "Get invoices by user id failed",
        status: error.status || 500,
        errors: error.message,
      });
    }
  },
  createInvoice: async (req, res) => {
    try {
      const data = req.body;
      console.log(data);
      if (!data) {
        const error = new Error("Data is required");
        error.status = 400;
        throw error;
      }
      const result = await InvoiceService.createInvoice(data);
      console.log(result);
      return successResponse({
        res,
        status: 201,
        message: "Create invoice successfully",
        data: result,
      });
    } catch (error) {
      console.log(error.message);
      return errorResponse({
        res,
        message: "Create invoice failed",
        status: error.status || 500,
        errors: error.message,
      });
    }
  },
  updateInvoiceStatus: async (req, res) => {
    try {
      const { invoiceId } = req.params;
      const { status } = req.body;
      const msg = await InvoiceService.updateInvoiceStatus(invoiceId, status);
      return successResponse({
        res,
        message: "Update invoice status successfully",
        data: msg,
      });
    } catch (error) {
      return errorResponse({
        res,
        message: "Update invoice status failed",
        status: error.status || 500,
        errors: error.message,
      });
    }
  },
};
