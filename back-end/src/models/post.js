const sql = require("mssql");

// Lấy tất cả bài viết
const getPosts = () => {
  return sql.query`SELECT [post].[id],
       [post_type].[type],
       [post].[post_type],
       [post].[title],
       [post].[content],
       [user].[fullname],
       [department].[name] AS department,
	     [post].[department_id],
       [post].[floor],
       [room].[name] AS room,
       [post].[room_id],
       [post].[expired_at],
       [post].[created_at],
       [post].[updated_at]
FROM [dbo].[post]
JOIN [dbo].[user] ON [post].[user_id] = [user].[id]
JOIN [dbo].[post_type] ON [post].[post_type] = [post_type].[id]
LEFT JOIN [dbo].[department] ON [post].[department_id] = [department].[id]
LEFT JOIN [dbo].[room] ON [post].[room_id] = [room].[id]
ORDER BY [post].[created_at] DESC

SELECT [room].[id] as room_id
      ,[room].[name]
      ,[room].[type_id]
      ,[department].[name] as department
	    ,[room].[department_id]
      ,[room].[created_at]
      ,[room].[updated_at]
  FROM [dbo].[room]
  LEFT JOIN [dbo].[department] ON [room].[department_id] = [department].[id]

   SELECT [post_type].[id],
		[post_type].[type],
		[post_type].[created_at],
		[post_type].[updated_at]
		FROM [dbo].[post_type]

    SELECT [department].[id],
		[department].[name] as department,
		[department].[created_at],
		[department].[updated_at]
		FROM [dbo].[department]
`;
};

// Lấy bài viết theo ID
const getPostById = (postId) => {
  return sql.query`
        SELECT 
    [post_type].[type],
    [post].[title],
    [post].[content],
    [user].[fullname],
    [department].[name] AS department,
    [post].[floor],
    [room].[name] AS room,
    [post].[expired_at],
    [post].[created_at],
    [post].[updated_at]
FROM 
    [dbo].[post]
JOIN 
    [dbo].[user] ON [post].[user_id] = [user].[id]
JOIN 
    [dbo].[post_type] ON [post].[post_type] = [post_type].[id]
LEFT JOIN 
    [dbo].[department] ON [post].[department_id] = [department].[id]
LEFT JOIN 
    [dbo].[room] ON [post].[room_id] = [room].[id]
WHERE 
    [post].[id] = ${postId}
ORDER BY 
    [post].[created_at] DESC;
    `;
};

// Tạo bài viết mới
const createPost = async (
  type_id,
  title,
  content,
  user_id,
  department_id,
  floor,
  room_id,
  expired_at
) => {
  try {
    const result = await sql.query`
          INSERT INTO [dbo].[post] ([post_type], [title], [content], [user_id], [department_id], [floor], [room_id], [expired_at], [created_at], [updated_at])
          OUTPUT INSERTED.id
          VALUES (${type_id}, ${title}, ${content}, ${user_id}, ${department_id}, ${floor}, ${room_id}, ${expired_at}, SYSDATETIME(), SYSDATETIME())
      `;

    // Lấy ID từ kết quả
    const postId = result.recordset[0].id;

    // Trả về ID cho client
    return postId;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error; // Hoặc xử lý lỗi theo cách bạn muốn
  }
};

// Cập nhật bài viết
const updatePost = (
  postId,
  type_id,
  title,
  content,
  user_id,
  department_id,
  floor,
  room_id,
  expired_at
) => {
  return sql.query`
        UPDATE [dbo].[post]
        SET [post_type] = ${type_id},
            [title] = ${title},
            [content] = ${content},
            [user_id] = ${user_id},
            [department_id] = ${department_id},
            [floor] = ${floor},
            [room_id] = ${room_id},
            [expired_at] = ${expired_at},
            [updated_at] = SYSDATETIME()
        WHERE [id] = ${postId}
    `;
};

// Xóa bài viết
const deletePost = (postId) => {
  return sql.query`
        DELETE FROM [dbo].[post]
        WHERE [id] = ${postId}
    `;
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost, // Xuất khẩu hàm cập nhật
  deletePost, // Xuất khẩu hàm xóa
};
