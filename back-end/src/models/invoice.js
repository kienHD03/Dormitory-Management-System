const sql = require("mssql");

module.exports = {
  createInvoice: ({
    amount,
    type,
    description = null,
    userId = null,
    roomId = null,
    status = "Chưa thanh toán",
    updateDate = null,
  }) => {
    return sql.query`
          INSERT INTO [dbo].[invoice]
           ([amount]
           ,[type]
           ,[status]
           ,[description]
           ,[user_id]
           ,[room_id]
           ,[created_at]
           ,[updated_at])
     VALUES
           (${amount}
           ,${type}
           ,${status}
           ,${description}
           ,${userId}
           ,${roomId}
           ,SYSDATETIME()
           ,${updateDate})
           `;
  },
  getInvoices: () => {
    return sql.query`
SELECT [invoice].[id]
      ,[invoice].[amount]
      ,[invoice].[type]
      ,[invoice].[status]
      ,[invoice].[description]
      ,[user].[email]
	  ,[room].[name] as room_name
      ,[invoice].[created_at]
      ,[invoice].[updated_at]
  FROM [invoice]
  LEFT JOIN [user]
  ON [invoice].[user_id] = [user].[id]
  LEFT JOIN [booking]
  ON [invoice].[user_id] = [booking].[user_id]
  LEFT JOIN [room]
  ON [booking].[room_id] = [room].[id]
  ORDER BY [id] DESC
    `;
  },
  getInvoiceByUserId: (userId) => {
    return sql.query`
        SELECT [invoice].[id]
      ,[invoice].[amount]
      ,[invoice].[type]
      ,[invoice].[status]
      ,[invoice].[description]
      ,[user].[email]
      ,[invoice].[created_at]
      ,[invoice].[updated_at]
  FROM [invoice]
  LEFT JOIN [user]
  ON [Invoice].[user_id] = [user].[id]
  WHERE [user].[id] = ${userId}
  ORDER BY [id] DESC
        `;
  },
  getNewestInvoice: (topNumber) => {
    return sql.query`
    SELECT TOP (${topNumber}) [invoice].[id]
      ,[invoice].[amount]
      ,[invoice].[type]
      ,[invoice].[status]
      ,[invoice].[description]
      ,[user].[email]
	  ,[room].[name] as room_name
      ,[invoice].[created_at]
      ,[invoice].[updated_at]
  FROM [invoice]
  LEFT JOIN [user]
  ON [Invoice].[user_id] = [user].[id]
  LEFT JOIN [booking]
  ON [invoice].[user_id] = [booking].[user_id]
  LEFT JOIN [room]
  ON [booking].[room_id] = [room].[id]
  ORDER BY [id] DESC
      `;
  },
  updateInvoiceStatus: (id, status) => {
    return sql.query`
    UPDATE [dbo].[invoice]
    SET [status] = ${status},
		[updated_at] = SYSDATETIME()
    WHERE [id] = ${id}
    `;
  },
};
