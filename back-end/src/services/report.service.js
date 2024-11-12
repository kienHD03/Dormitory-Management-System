const report = require("../models/report");

// Lấy tất cả yêu cầu
const getReports = async () => {
    try {
        const reports = await report.getReports();
        console.log(reports);

        // Lấy dữ liệu từ recordsets
        const [reportsInfo, staffs, rooms] = reports.recordsets;

        // Kiểm tra xem có báo cáo nào không
        if (reportsInfo.length === 0) {
            console.warn("No reports found, but other data will be returned.");
        }

        // Trả về thông tin báo cáo và các phần khác
        return { reportsInfo, staffs, rooms };
    } catch (error) {
        console.error("Error fetching reports:", error);
        throw error;
    }
};


// Lấy yêu cầu theo ID
const getReportById = async (user_Id) => {
    try {
        const report = await report.getReportById(user_Id);
        if (report.recordset.length === 0) {
            const error = new Error("Report not found");
            error.status = 404;
            throw error;
        }
        return report.recordset[0]; // Trả về yêu cầu tìm thấy
    } catch (error) {
        console.error("Error fetching report by ID:", error);
        throw error;
    }
};

// Tạo yêu cầu mới
const createReport = async (title, content, user_Id, staff_id, room_id, expired_at) => {
    try {
        await report.createReport(title, content, user_Id, staff_id, room_id, expired_at);
        return { message: "Report created successfully" };
    } catch (error) {
        console.error("Error creating report:", error);
        throw error;
    }
};

// Cập nhật trạng thái yêu cầu
const updateStatusReport = async (reportId) => {
    try {
        await report.updateStatusReport(reportId);
        return { message: "Report status updated successfully" };
    } catch (error) {
        throw new Error("Error updating post: " + error.message);
    }
};

// Cập nhật yêu cầu
const updateReport = async (reportId, reply, status) => {
    try {
        await report.updateReport(reportId, reply, status);
        return { message: "Report updated successfully" };
    } catch (error) {
        throw new Error("Error updating post: " + error.message);
    }
};

// Xóa yêu cầu
const deleteReport = async (reportId) => {
    try {
        const result = await report.deleteReport(reportId);
        if (result.rowsAffected[0] === 0) {
            const error = new Error("Report not found");
            error.status = 404;
            throw error;
        }
        return { message: "Report deleted successfully" };
    } catch (error) {
        console.error("Error deleting report:", error);
        throw error;
    }
};

// Xóa đăng ký phòng theo user_id
    const deleteBookingById = async (reportId) => {
        try {
            await report.deleteBookingById(reportId);
            return { message: "User subscription deleted successfully" };
        } catch (error) {
            console.error("Error deleting user subscription:", error);
            throw error;
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
