const RequestService = require("../services/request.service");
const { successResponse, errorResponse } = require("../utils/response");

// Lấy tất cả yêu cầu
const getRequests = async (req, res) => {
  try {
    const Requests = await RequestService.getRequests();
    return successResponse({
      res,
      message: "Get Requests successfully",
      data: Requests,
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
const getRequestById = async (req, res) => {
  const { user_id } = req.params;
  try {
    const request = await RequestService.getRequestById(user_id);
    return successResponse(res, request);
  } catch (error) {
    console.error("Error in getRequestById:", error);
    return errorResponse(res, error);
  }
};

// Tạo yêu cầu mới
const createRequest = async (req, res) => {
  try {
    const { title, content, user_id, room_id } = req.body; // Get title, content, and user_id from body

    // Input validation
    if (!title || !content || !user_id || !room_id) {
      const error = new Error("Request is required");
      error.status = 400;
      throw error;
    }

    // Call the service to create a Request
    const newRequest = await RequestService.createRequest(
      title,
      content,
      user_id,
      room_id
    );

    // Success response with created Request details
    return successResponse({
      res,
      message: "Request created successfully",
      data: newRequest, // Include the created Request in the response if needed
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
const updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply, status } = req.body;
    if (!id) {
      const error = new Error("Request id is required");
      error.status = 400;
      throw error;
    }

    // Nếu chỉ có status được cung cấp
    if (!reply && status) {
      await RequestService.updateStatusRequest(id);
      return successResponse({
        res,
        message: "Request status updated successfully",
      });
    }

    // Nếu cả reply và status đều được cung cấp
    if (reply && status) {
      await RequestService.updateRequest(id, reply, status);
      return successResponse({
        res,
        message: "Request updated successfully",
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
const updateStatusRequest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      const error = new Error("Request id is required");
      error.status = 400;
      throw error;
    }
    await RequestService.updateStatusRequest(id);
    return successResponse({
      res,
      message: "Request status updated successfully",
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
const deleteRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await RequestService.deleteRequest(id);
    return successResponse(res, response);
  } catch (error) {
    console.error("Error in deleteRequest:", error);
    return errorResponse(res, error);
  }
};

// Xóa đăng ký phòng theo user_id
  const deleteBookingById = async (req, res) => {
    const { id } = req.params;
    try {
      await RequestService.deleteBookingById(id);
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
  getRequests,
  getRequestById,
  createRequest,
  updateStatusRequest,
  updateRequest,
  deleteRequest,
  deleteBookingById,
};
