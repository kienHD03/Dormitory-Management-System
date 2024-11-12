const ReportService = require("../services/report.service");
const { successResponse, errorResponse } = require("../utils/response");

// Lấy tất cả yêu cầu
const getReports = async (req, res) => {
  try {
    const Reports = await ReportService.getReports();
    return successResponse({
      res,
      message: "Get Reports successfully",
      data: Reports,
    });
  } catch (e) {
    return errorResponse({
      res,
      message: e.message,
      status: e.status || 500,
      errors: e.message,
    });
  }
};

// Lấy yêu cầu theo ID
const getReportById = async (req, res) => {
  const { user_id } = req.params;
  try {
    const report = await ReportService.getReportById(user_id);
    return successResponse(res, report);
  } catch (error) {
    console.error("Error in getReportById:", error);
    return errorResponse(res, error);
  }
};

// Tạo yêu cầu mới
const createReport = async (req, res) => {
  try {
    const { title, content, user_id, staff_id, room_id, expired_at } = req.body; // Get title, content, and user_id from body

    // Input validation
    if (!title || !content || !user_id || !staff_id || !room_id || !expired_at) {
      const error = new Error("Report is required");
      error.status = 400;
      throw error;
    }

    // Call the service to create a Report
    const newReport = await ReportService.createReport(
      title,
      content,
      user_id, 
      staff_id,
      room_id,
      expired_at
    );

    // Success response with created Report details
    return successResponse({
      res,
      message: "Report created successfully",
      data: newReport, // Include the created Report in the response if needed
    });
  } catch (e) {
    // Error response
    return errorResponse({
      res,
      message: e.message,
      status: e.status || 500,
      errors: e.errors || e.message, // Ensure proper error details
    });
  }
};

// Cập nhật yêu cầu
const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply, status} = req.body;
    if (!id) {
      const error = new Error("Report id is required");
      error.status = 400;
      throw error;
    }

    // Nếu chỉ có status được cung cấp
    if (!reply && status) {
      await ReportService.updateStatusReport(id);
      return successResponse({
        res,
        message: "Report status updated successfully",
      });
    }

    // Nếu cả reply và status đều được cung cấp
    if (reply && status) {
      await ReportService.updateReport(id, reply, status);
      return successResponse({
        res,
        message: "Report updated successfully",
      });
    }
  } catch (e) {
    return errorResponse({
      res,
      message: e.message,
      status: e.status || 500,
      errors: e.errors || e.message,
    });
  }
};

// Cập nhật trạng thái yêu cầu
const updateStatusReport = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      const error = new Error("Report id is required");
      error.status = 400;
      throw error;
    }
    await ReportService.updateStatusReport(id);
    return successResponse({
      res,
      message: "Report status updated successfully",
    });
  } catch (e) {
    return errorResponse({
      res,
      message: e.message,
      status: e.status || 500,
      errors: e.errors || e.message,
    });
  }
};

// Xóa yêu cầu
const deleteReport = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await ReportService.deleteReport(id);
    return successResponse(res, response);
  } catch (error) {
    console.error("Error in deleteReport:", error);
    return errorResponse(res, error);
  }
};

// Xóa đăng ký phòng theo user_id
  const deleteBookingById = async (req, res) => {
    const { id } = req.params;
    try {
      await ReportService.deleteBookingById(id);
      return successResponse({
        res,
        message: "Subscription deleted successfully",
      });
    } catch (error) {
      console.error("Error in delete booking:", error);
      return errorResponse(res, error);
    }
  };

module.exports = {
  getReports,
  getReportById,
  createReport,
  updateStatusReport,
  updateReport,
  deleteReport,
  deleteBookingById,
};
