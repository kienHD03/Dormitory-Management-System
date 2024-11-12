const request = require("../models/request");

// Lấy tất cả yêu cầu
const getRequests = async () => {
  try {
    const requests = await request.getRequests();

    // Lấy dữ liệu từ recordsets
    const [requestsInfo, rooms] = requests.recordsets;

    // Kiểm tra xem có yêu cầu nào không
    // if (requestsInfo.length === 0) {
    //   console.warn("No requests found, but other data will be returned.");
    // }

    // Trả về thông tin yêu cầu và các phần khác nếu cần
    return {
      requests: requestsInfo, // Danh sách yêu cầu
      rooms, // Danh sách phòng
    };
  } catch (error) {
    console.error("Error fetching requests:", error);
    throw error;
  }
};

// Lấy yêu cầu theo ID
const getRequestById = async (user_Id) => {
  try {
    const request = await request.getRequestById(user_Id);
    if (request.recordset.length === 0) {
      const error = new Error("Request not found");
      error.status = 404;
      throw error;
    }
    return request.recordset[0]; // Trả về yêu cầu tìm thấy
  } catch (error) {
    console.error("Error fetching request by ID:", error);
    throw error;
  }
};

// Tạo yêu cầu mới
const createRequest = async (title, content, user_Id, room_id) => {
  try {
    await request.createRequest(title, content, user_Id, room_id);
    return { message: "Request created successfully" };
  } catch (error) {
    console.error("Error creating request:", error);
    throw error;
  }
};

// Cập nhật trạng thái yêu cầu
const updateStatusRequest = async (requestId) => {
  try {
    await request.updateStatusRequest(requestId);
    return { message: "Request status updated successfully" };
  } catch (error) {
    throw new Error("Error updating post: " + error.message);
  }
};

// Cập nhật yêu cầu
const updateRequest = async (requestId, reply, status) => {
  try {
    await request.updateRequest(requestId, reply, status);
    return { message: "Request updated successfully" };
  } catch (error) {
    throw new Error("Error updating post: " + error.message);
  }
};

// Xóa yêu cầu
const deleteRequest = async (requestId) => {
  try {
    const result = await request.deleteRequest(requestId);
    if (result.rowsAffected[0] === 0) {
      const error = new Error("Request not found");
      error.status = 404;
      throw error;
    }
    return { message: "Request deleted successfully" };
  } catch (error) {
    console.error("Error deleting request:", error);
    throw error;
  }
};

// Xóa đăng ký phòng theo user_id
const deleteBookingById = async (requestId) => {
  try {
    await request.deleteBookingById(requestId);
    return { message: "User subscription deleted successfully" };
  } catch (error) {
    console.error("Error deleting user subscription:", error);
    throw error;
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
