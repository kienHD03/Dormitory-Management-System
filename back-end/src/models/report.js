const sql = require("mssql");

// Lấy tất cả yêu cầu
const getReports = () => {
  return sql.query`SELECT[report].[id],
    [report].[title],
    [report].[content],
    [report].[reply],
    [report].[status],
    [report].[user_id],
    [user].[fullname] AS user_fullname,
    [report].[staff_id],
    staff_user.[fullname] AS staff_fullname,
    staff_user.[email] AS staff_email,
	[report].[room_id],
	[room].[name] AS room,
	[department].[name] AS department,
	[report].[expired_at],
    [report].[created_at],
    [report].[updated_at]
FROM 
    [dbo].[report]
JOIN 
    [dbo].[user] ON [report].[user_id] = [user].[id]
JOIN 
    [dbo].[room] ON [report].[room_id] = [room].[id]
JOIN 
	[dbo].[department] ON [room].[department_id] = [department].[id]
LEFT JOIN 
    [dbo].[user] AS staff_user ON [report].[staff_id] = staff_user.[id];
    
    SELECT [user].[id]
      ,[user].[email]
      ,[user].[fullname]
      ,[user].[role_id]
  FROM [dbo].[user]
  Where [user].[role_id] = '3'

  SELECT [room].[id]
      ,[room].[name]
  FROM [dbo].[room]
    `;
};

// Lấy yêu cầu theo ID
const getReportById = (user_Id) => {
  return sql.query`
        SELECT [report].[title],
               [report].[content],
               [report].[reply],
               [report].[status],
               [report].[user_id],
               [report].[created_at],
               [report].[updated_at]
        FROM [dbo].[report]
        WHERE [report].[user_id] = ${user_Id}
    `;
};

// Tạo yêu cầu mới
const createReport = (title, content, user_Id, staff_id, room_id, expired_at) => {
  return sql.query`
        INSERT INTO [dbo].[report] ([title], [content], [status], [reply], [user_id], [staff_id], [room_id], [expired_at], [created_at], [updated_at])
        VALUES (${title}, ${content}, '0', '', ${user_Id}, ${staff_id}, ${room_id}, ${expired_at}, SYSDATETIME(), SYSDATETIME())
    `;
};

// Cập nhật trạng thái yêu cầu
const updateStatusReport = (reportId) => {
  return sql.query` 
          UPDATE [dbo].[report]
          SET [status] ='1',
              [updated_at] = SYSDATETIME()
          WHERE [id] = ${reportId}
      `;
};

// Cập nhật yêu cầu
const updateReport = (reportId, reply, status) => {
  return sql.query` 
        UPDATE [dbo].[report]
        SET [reply] =${reply},
            [status] = ${status},
            [updated_at] = SYSDATETIME()
        WHERE [id] = ${reportId}
    `;
};

// Xóa yêu cầu
const deleteReport = (reportId) => {
  return sql.query`
        DELETE FROM [dbo].[report]
        WHERE [id] = ${reportId}
    `;
};

// Xóa đăng ký phòng theo user_id
const deleteBookingById = (reportId) => {
  return sql.query`
        DELETE FROM [dbo].[booking]
WHERE [user_id] = (SELECT [user_id] FROM [dbo].[report] WHERE [id] = ${reportId});
    `;
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
