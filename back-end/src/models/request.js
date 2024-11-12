const sql = require("mssql");

// Lấy tất cả yêu cầu
const getRequests = () => {
  return sql.query`SELECT 
    [request].[id],
    [request].[title],
    [request].[content],
    [request].[reply],
    [request].[status],
    [request].[user_id],
    [user].[fullname],
    [user].[email],
    [user].[role_id],
    [role].[name] AS role_name,
	[request].[room_id],
	[request].[staff_id],
    [request].[created_at],
    [request].[updated_at]
FROM 
    [dbo].[request]
JOIN 
    [dbo].[user] ON [request].[user_id] = [user].[id]
JOIN 
    [dbo].[role] ON [user].[role_id] = [role].[id]
    
    SELECT [room].[id]
      ,[room].[name]
  FROM [SWP391].[dbo].[room]
    ;`;
};

// Lấy yêu cầu theo ID
const getRequestById = (user_Id) => {
  return sql.query`
        SELECT [request].[title],
               [request].[content],
               [request].[reply],
               [request].[status],
               [request].[user_id],
               [request].[created_at],
               [request].[updated_at]
        FROM [dbo].[request]
        WHERE [request].[user_id] = ${user_Id}
    `;
};

// Tạo yêu cầu mới
const createRequest = (title, content, user_Id, room_id) => {
  return sql.query`
        INSERT INTO [dbo].[request] ([title], [content], [status], [reply], [user_id], [room_id], [created_at], [updated_at])
        VALUES (${title}, ${content}, '1', '', ${user_Id}, ${room_id}, SYSDATETIME(), SYSDATETIME())
    `;
};

// Cập nhật trạng thái yêu cầu
const updateStatusRequest = (requestId) => {
  return sql.query` 
          UPDATE [dbo].[request]
          SET [status] ='1',
              [updated_at] = SYSDATETIME()
          WHERE [id] = ${requestId}
      `;
};

// Cập nhật yêu cầu
const updateRequest = (requestId, reply, status) => {
  return sql.query` 
        UPDATE [dbo].[request]
        SET [reply] =${reply},
            [status] = ${status},
            [updated_at] = SYSDATETIME()
        WHERE [id] = ${requestId}
    `;
};

// Xóa yêu cầu
const deleteRequest = (requestId) => {
  return sql.query`
        DELETE FROM [dbo].[request]
        WHERE [id] = ${requestId}
    `;
};

// Xóa đăng ký phòng theo user_id
const deleteBookingById = (requestId) => {
  return sql.query`
        DELETE FROM [dbo].[booking]
WHERE [user_id] = (SELECT [user_id] FROM [dbo].[request] WHERE [id] = ${requestId});
    `;
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
