const sql = require("mssql");

module.exports = {
  getRooms: () => {
    return sql.query`
	  SELECT 
	[room].[id],
    [room].[name] AS room,
    COUNT([booking].[id]) AS people_count,
    [room_type].[capacity],
    [room_type].[name] AS room_type,
    [room_type].[gender],
    [room_type].[price],
    [department].[name] AS department
    ,[room].[expired_at] as room_expired_date
FROM 
    [dbo].[room]
LEFT JOIN 
    [dbo].[booking] ON [booking].[room_id] = [room].[id]
LEFT JOIN 
    [dbo].[user] ON [booking].[user_id] = [user].[id]
LEFT JOIN 
    [dbo].[bed] ON [booking].[bed_id] = [bed].[id]
LEFT JOIN 
    [dbo].[room_type] ON [room].[type_id] = [room_type].[id]
LEFT JOIN 
    [dbo].[department] ON [room].[department_id] = [department].[id]
GROUP BY 
	[room].[id],
    [room].[name], 
    [room_type].[capacity], 
    [room_type].[name], 
    [room_type].[gender], 
    [room_type].[price], 
    [department].[name],
	[room].[expired_at]

  SELECT [department].[id], [department].[name] FROM [dbo].[department]

  SELECT [booking].[id]
      ,[user].[email]    
      ,[bed].[name] as bed
      ,[room].[name] as room
	  ,COUNT([booking].[id]) OVER (PARTITION BY [room].[id]) AS people_count
	  ,[room_type].[capacity]
	  ,[room_type].[name] as room_type
	  ,[room_type].[gender]
	  ,[room_type].[price]
	  ,[department].[name]
    ,[room].[expired_at] as room_expired_date
      ,[booking].[created_at]
      ,[booking].[expired_at]
  FROM [dbo].[booking]
  JOIN [dbo].[user]
  ON [booking].[user_id] = [user].[id]
  JOIN [dbo].[bed]
  ON [booking].[bed_id] = [bed].[id]
  RIGHT JOIN [dbo].[room]
  ON [booking].[room_id] = [room].[id]
  JOIN [dbo].[room_type] 
  ON [room].[type_id] = [room_type].[id]
  JOIN [dbo].[department]
  ON [room].[department_id] = [department].[id]

  
	SELECT [bed].id,[bed].[name] FROM [dbo].[bed]
`;
  },
  createRoom: (roomName, roomTypeName, roomType, departmentName) => {
    return sql.query`
    INSERT INTO [dbo].[room]
           ([name]
           ,[type_id]
           ,[department_id]
           ,[created_at]
           ,[updated_at])
     VALUES
           (${roomName}
           ,(SELECT [room_type].[id] FROM [dbo].[room_type]
            WHERE [room_type].[name] LIKE ${roomTypeName}
            AND [room_type].[type] = ${roomType})
           ,(SELECT [department].[id] FROM [dbo].[department]
			      WHERE [department].[name] LIKE ${departmentName})
           ,SYSDATETIME()
           ,SYSDATETIME())
    `;
  },
  updateRoom: (roomName, roomTypeName, roomType, departmentName, roomId) => {
    return sql.query`
    UPDATE [dbo].[room]
   SET [name] = ${roomName}
      ,[type_id] = (SELECT [room_type].[id] FROM [dbo].[room_type]
			WHERE [room_type].[name] LIKE ${roomTypeName}
			AND [room_type].[type] = ${roomType})
      ,[department_id] = (SELECT [department].[id] FROM [dbo].[department]
		WHERE [department].[name] LIKE ${departmentName})
      ,[updated_at] = SYSDATETIME()
 WHERE [dbo].[room].[id] = ${roomId}
    `;
  },

  bookingRoom: (userId, roomId, bedId, expiredAt) => {
    return sql.query`
   INSERT INTO [dbo].[booking]
           ([user_id]
           ,[bed_id]
           ,[room_id]
           ,[created_at]
           ,[updated_at]
           ,[expired_at])
     VALUES
           (${userId}
           ,${bedId}
           ,${roomId}
           ,SYSDATETIME()
           ,SYSDATETIME()
           ,${expiredAt})
    `;
  },
  getRoomById: (id) => {
    return sql.query`
   SELECT [booking].[id]
		,[user].[id] as userId
      ,[user].[email]
	  ,[bed].[id] as bedId
      ,[bed].[name] as bed
      ,[room].[name] as room
	  ,COUNT([booking].[id]) OVER (PARTITION BY [room].[id]) AS people_count
	  ,[room_type].[capacity]
	  ,[room_type].[name] as room_type
	  ,[room_type].[gender]
	  ,[room_type].[price]
	  ,[department].[name]
      ,[booking].[created_at]
      ,[booking].[expired_at]
  FROM [dbo].[booking]
  JOIN [dbo].[user]
  ON [booking].[user_id] = [user].[id]
  JOIN [dbo].[bed]
  ON [booking].[bed_id] = [bed].[id]
  RIGHT JOIN [dbo].[room]
  ON [booking].[room_id] = [room].[id]
  JOIN [dbo].[room_type] 
  ON [room].[type_id] = [room_type].[id]
  JOIN [dbo].[department]
  ON [room].[department_id] = [department].[id]
  WHERE [room].[id] = ${id}

    `;
  },

  getRoomIdByName: (roomName) => {
    return sql.query`
    SELECT [room].[id] FROM [dbo].[room]
    WHERE [room].[name] LIKE ${roomName}
    `;
  },
  getRoomTypes: () => {
    return sql.query`
    SELECT [id]
      ,[name]
      ,[capacity]
      ,[price]
      ,[gender]
  FROM [dbo].[room_type]
    `;
  },

  updateRoomExpiredDate: (expriredDate) => {
    return sql.query`
  UPDATE [room]
SET expired_at = ${expriredDate}
  `;
  },
  getRoomExpiredDate: (roomId) => {
    return sql.query`
    SELECT [room].[expired_at] FROM [dbo].[room]`;
  },
  updateBookingExpiredDate: (userId, expiredDate) => {
    return sql.query`
    UPDATE [dbo].[booking]
    SET [expired_at] = ${expiredDate}
    WHERE [user_id] = ${userId}
    `;
  },
  deleteBookingByUserId(userId) {
    return sql.query`
    DELETE FROM [dbo].[booking]
    WHERE [user_id] = ${userId}
    `;
  },
};
