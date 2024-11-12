const sql = require("mssql");

const getUsers = () => {
  return sql.query`
  SELECT [user].[id]
      ,[user].[email]
      ,[user].[fullname]
      ,[user].[phone]
      ,[user].[gender]
      ,[user].[status]
      ,[role].[name] as role
	  ,[room].[name] as room
	  ,[bed].[name] as bed
	  ,[department].[name] as department
    ,[booking].[expired_at]
  FROM [dbo].[user]
  LEFT JOIN [dbo].[booking]
  ON [user].[id] = [booking].[user_id]
  LEFT JOIN [dbo].[room]
  ON [booking].[room_id] = [room].[id]
  LEFT JOIN [dbo].[bed]
  ON [booking].[bed_id] = [bed].[id]
  LEFT JOIN [dbo].[role]
  ON [user].[role_id] = [role].[id]
  LEFT JOIN [dbo].[department]
  ON [department].[id] = [room].[department_id]`;
};

const getUserByEmail = (email) => {
  return sql.query`
SELECT [user].[id]
      ,[user].[email]
      ,[user].[password]
      ,[user].[fullname]
      ,[user].[phone]
      ,[user].[gender]
      ,[user].[status]
      ,[role].[name] as role
	  ,[room].[id] as room_id
	  ,[room].[name] as room
	  ,[bed].[id] as bed_id
	  ,[bed].[name] as bed
	  ,[department].[name] as department
    ,[booking].[expired_at]
  FROM [dbo].[user]
  LEFT JOIN [dbo].[booking]
  ON [user].[id] = [booking].[user_id]
  LEFT JOIN [dbo].[room]
  ON [booking].[room_id] = [room].[id]
  LEFT JOIN [dbo].[bed]
  ON [booking].[bed_id] = [bed].[id]
  LEFT JOIN [dbo].[role]
  ON [user].[role_id] = [role].[id]
  LEFT JOIN [dbo].[department]
  ON [department].[id] = [room].[department_id]
	WHERE [user].[email] LIKE ${email}
`;
};

const createUser = (
  fullname,
  email,
  gender = 1,
  password = null,
  status = 0,
  role = 4,
  phone = null
) => {
  return sql.query`
INSERT INTO [dbo].[user]
           ([email]
           ,[password]
           ,[fullname]
           ,[phone]
           ,[gender]
           ,[status]
           ,[role_id]
           ,[created_at]
           ,[updated_at])
     VALUES
           (${email}
           ,${password}
           ,${fullname}
           ,${phone}
           ,${gender}
           ,${status}
           ,${role}
           ,SYSDATETIME()
           ,SYSDATETIME())
  `;
};

const checkAccountVerified = (email) => {
  return sql.query`SELECT [user_otp].[id]
	  ,[user_otp].[user_id]
      ,[user].[email]
      ,[user].[status]
      ,[user_otp].[otp]
      ,[user_otp].[created_at]
      ,[user_otp].[updated_at]
      ,[user_otp].[expired_at]
  FROM [dbo].[user_otp]
  JOIN [dbo].[user]
  ON [dbo].[user_otp].[user_id] = [dbo].[user].[id]
  WHERE [user].[email] like ${email}`;
};

const updateUserStatus = (email) => {
  return sql.query`UPDATE [dbo].[user]
   SET
     [status] = 1
      ,[updated_at] = SYSDATETIME()
 WHERE [email] LIKE ${email}`;
};

const createUserOtp = (id, otp) => {
  return sql.query`INSERT INTO [dbo].[user_otp]
           ([user_id]
           ,[otp]
           ,[created_at]
           ,[updated_at]
           ,[expired_at])
     VALUES
           (${id}
           ,${otp}
           ,SYSDATETIME()
           ,SYSDATETIME()
           ,DATEADD(SECOND, 60, SYSDATETIME()))`;
};

const updateUserOTP = (email, otp) => {
  return sql.query`UPDATE [dbo].[user_otp]
   SET 
       [otp] = ${otp}
      ,[updated_at] = SYSDATETIME()
      ,[expired_at] = DATEADD(SECOND, 60, SYSDATETIME())
        FROM [dbo].[user_otp]
        JOIN [dbo].[user] 
        ON [dbo].[user_otp].[user_id] = [dbo].[user].[id]
        WHERE [dbo].[user].[email] = ${email}`;
};

const getUsersByRoomName = (roomName) => {
  return sql.query`
  SELECT [booking].[id]
      ,[user].[id] as user_id
      ,[user].[email]    
      ,[bed].[name] as bed
	  ,[room].[id] as room_id
      ,[room].[name] as room
	  ,COUNT([booking].[id]) OVER (PARTITION BY [room].[id]) AS people_count
	  ,[room_type].[capacity]
	  ,[room_type].[name] as room_type
	  ,[room_type].[gender]
	  ,[room_type].[price]
	  ,[department].[name] as department_name
      ,[booking].[created_at]
      ,[booking].[expired_at]
  FROM [dbo].[booking]
  LEFT JOIN [dbo].[user]
  ON [booking].[user_id] = [user].[id]
  LEFT JOIN [dbo].[bed]
  ON [booking].[bed_id] = [bed].[id]
  LEFT JOIN [dbo].[room]
  ON [booking].[room_id] = [room].[id]
  LEFT JOIN [dbo].[room_type] 
  ON [room].[type_id] = [room_type].[id]
  LEFT JOIN [dbo].[department]
  ON [room].[department_id] = [department].[id]
  WHERE [room].[name] LIKE ${roomName} 
  `;
};

const updateUserById = (id, fullname, phone, gender) => {
  return sql.query`
    UPDATE [dbo].[user]
    SET 
        [fullname] = ${fullname},
        [phone] = ${phone},
        [gender] = ${gender}
        
    WHERE [id] = ${id}
  `;
};

const getUserById = (userId) => {
  return sql.query`
  SELECT [user].[id]
      ,[user].[email]
      ,[user].[password]
      ,[user].[fullname]
      ,[user].[phone]
      ,[user].[gender]
      ,[user].[status]
      ,[role].[name] as role
	  ,[room].[id] as room_id
	  ,[room].[name] as room
,[room_type].[price] as room_price
	  ,[bed].[id] as bed_id
	  ,[bed].[name] as bed
	  ,[department].[name] as department
    ,[booking].[expired_at]
  FROM [dbo].[user]
  LEFT JOIN [dbo].[booking]
  ON [user].[id] = [booking].[user_id]
  LEFT JOIN [dbo].[room]
  ON [booking].[room_id] = [room].[id]
  LEFT JOIN [dbo].[bed]
  ON [booking].[bed_id] = [bed].[id]
  LEFT JOIN [dbo].[role]
  ON [user].[role_id] = [role].[id]
  LEFT JOIN [dbo].[department]
  ON [department].[id] = [room].[department_id]
  LEFT JOIN [dbo].[room_type]
  ON [room].[type_id] = [room_type].[id]
	WHERE [user].[id] LIKE ${userId}
  `;
};

const deleteUserById = (userId) => {
  return sql.query`
  DELETE FROM [dbo].[user_otp]
      WHERE [user_otp].[user_id] = ${userId}
  DELETE FROM [dbo].[user] WHERE [id] = ${userId}
  `;
};

const updateUserRole = (id, role) => {
  return sql.query`
    UPDATE [dbo].[user]
    SET 
        [role_id] = ${role}
    WHERE [id] = ${id}
  `;
};

const updateUserBooking = (userId, bedId, roomId) => {
  return sql.query`
    UPDATE [dbo].[booking]
      SET 
          [bed_id] = ${bedId}, 
          [room_id] = ${roomId},
          [updated_at] = SYSDATETIME()
      WHERE [user_id] = ${userId}
  `;
};

const deleteUserBooking = (userId) => {
  return sql.query`DELETE FROM [dbo].[booking] WHERE [user_id] = ${userId}`;
};

const updatePassword = async (userId, newPassword) => {
  try {
    const result = await sql.query`
      UPDATE [dbo].[user]
      SET 
          [password] = ${newPassword}
      WHERE [id] = ${userId}
    `;

    if (result.rowsAffected[0] === 0) {
      throw new Error("Không tìm thấy người dùng hoặc không thể cập nhật mật khẩu");
    }

    return { message: "Cập nhật mật khẩu thành công" };
  } catch (error) {
    console.error("Lỗi khi cập nhật mật khẩu:", error);
    throw error;
  }
};

const createResidentHistory = (userId, roomId, bedId, description = null, expiredAt) => {
  console.log(expiredAt);
  return sql.query`
    INSERT INTO [dbo].[resident_history]
           ([user_id]
           ,[room_id]
           ,[bed_id]
           ,[description]
           ,[created_at]
           ,[expired_at])
     VALUES
           (${userId}
           ,${roomId}
           ,${bedId}
           ,${description}
           ,SYSDATETIME()
           ,${expiredAt})
  `;
};

const getResidentHistoryByUserId = (userId) => {
  return sql.query`
SELECT [resident_history].[id]
      ,[user].[email]
    ,[bed].[name] as bed
      ,[room].[name] as room
      ,[description]
      ,[resident_history].[created_at]
      ,[resident_history].[expired_at]
FROM [dbo].[resident_history]
LEFT JOIN [room]
ON [room].[id] = [resident_history].[room_id]
LEFT JOIN [bed]
ON [bed].[id] = [resident_history].[bed_id]
LEFT JOIN [user]
ON [resident_history].[user_id] = [user].[id]
WHERE [user].[id] = ${userId}
ORDER BY [resident_history].[id] DESC
          `;
};

const getAllResidentHistory = () => {
  return sql.query`
 SELECT [resident_history].[id]
      ,[user].[email]
      ,[bed].[name]
      ,[room].[name]
      ,[description]
      ,[resident_history].[created_at]
      ,[resident_history].[expired_at]
FROM [dbo].[resident_history]
LEFT JOIN [room]
ON [room].[id] = [resident_history].[room_id]
LEFT JOIN [bed]
ON [bed].[id] = [resident_history].[bed_id]
LEFT JOIN [user]
ON [resident_history].[user_id] = [user].[id]
  ORDER BY [resident_history].[id]  DESC`;
};

module.exports = {
  getUsers,
  getUserByEmail,
  createUser,
  createUserOtp,
  updateUserOTP,
  checkAccountVerified,
  updateUserStatus,
  getUsersByRoomName,
  updateUserById,
  getUserById,
  deleteUserById,
  updateUserRole,
  updatePassword,
  updateUserBooking,
  deleteUserBooking,
  createResidentHistory,
  getResidentHistoryByUserId,
  getAllResidentHistory,
};
