const Invoice = require("../models/invoice");
const User = require("../models/user");
const Room = require("../models/room");

module.exports = {
  getInvoices: async () => {
    try {
      const invoices = await Invoice.getInvoices();
      return invoices.recordset;
    } catch (error) {
      throw error;
    }
  },
  getInvoiceByUserId: async (userId) => {
    try {
      const invoice = await Invoice.getInvoiceByUserId(userId);
      return invoice.recordset;
    } catch (error) {
      throw error;
    }
  },
  createInvoice: async (data) => {
    try {
      if (!data.room) {
        const findUserId = await User.getUserByEmail(data.email);
        if (findUserId.recordset.length === 0) {
          const error = new Error("User not found with this email");
          error.status = 404;
          throw error;
        }
        const result = await Invoice.createInvoice({
          amount: data.amount,
          type: data.type,
          data: data.description,
          userId: findUserId.recordset[0].id,
          status: data.status || "Chưa thanh toán",
          updateDate: data.updateDate || null,
          description: data.description || null,
        });
        if (result.rowsAffected[0] === 0) {
          const error = new Error("Create invoice failed");
          error.status = 400;
          throw error;
        }
        const newInvoice = await Invoice.getNewestInvoice(1);
        return newInvoice.recordset;
      }
      if (data.room) {
        const userInfos = await User.getUsersByRoomName(data.room);
        if (userInfos.recordset.length === 0) {
          const error = new Error("User not found with this room number");
          error.status = 404;
          throw error;
        }

        console.log(userInfos.recordset);
        userInfos.recordset.forEach(async (user) => {
          const result = await Invoice.createInvoice({
            amount: data.amount / userInfos.recordset.length,
            type: data.type,
            description: `Số điện: ${data.electricity} - ${data.electricity * 3000}đ,
                          Số nước ${data.water} - ${data.water * 10000}đ`,
            userId: user.user_id,
            roomId: user.room_id,
          });
          if (result.rowsAffected[0] === 0) {
            const error = new Error("Create invoice failed");
            error.status = 400;
            throw error;
          }
        });
        const newInvoice = await Invoice.getNewestInvoice(userInfos.recordset.length);
        return newInvoice.recordset;
      }
    } catch (error) {
      throw error;
    }
  },
  updateInvoiceStatus: async (invoiceId, status) => {
    try {
      const result = await Invoice.updateInvoiceStatus(invoiceId, status);
      if (result.rowsAffected.length === 0) {
        const error = new Error("Update invoice status failed");
        error.status = 400;
        throw error;
      }

      return "Update invoice status successfully";
    } catch (error) {
      throw error;
    }
  },
};
