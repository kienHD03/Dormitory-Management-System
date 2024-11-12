const post = require("../models/post");

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
  if (!title || !content || !user_id) {
    throw new Error("Title, content, and user ID are required.");
  }

  try {
    // Gọi hàm createPost từ mô-đun post với các tham số cần thiết
    const newPostId = await post.createPost(
      type_id,
      title,
      content,
      user_id,
      department_id,
      floor,
      room_id,
      expired_at
    );
    return { message: "Post created successfully", postId: newPostId };
  } catch (error) {
    console.error("Error creating post:", error);
    throw new Error("Error creating post: " + error.message);
  }
};

// Lấy tất cả bài viết
const getPosts = async () => {
  try {
    const posts = await post.getPosts();
    console.log(posts);

    // Lấy từng phần dữ liệu từ recordsets
    const [postsInfo, rooms, postType, departmentInfo] = posts.recordsets;

    // Nếu không có bài đăng, vẫn tiếp tục lấy dữ liệu các phần khác
    if (postsInfo.length === 0) {
      console.warn("No posts found, but other data will be returned.");
    }

    // Kết hợp thông tin phòng với bài đăng
    const roomMap = rooms.reduce((acc, room) => {
      acc[room.id] = room;
      return acc;
    }, {});

    const mergedPosts = postsInfo.map((post) => {
      const roomDetails = roomMap[post.room_id] || {};
      return { ...post, roomDetails };
    });

    return { postsInfo, rooms, postType, departmentInfo, mergedPosts };
  } catch (error) {
    throw error;
  }
};


// Lấy bài viết theo ID
const getPostById = async (id) => {
  try {
    const post = await post.getPostById(id);
    if (!post.recordset.length) {
      throw new Error("Post not found");
    }
    return post.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Cập nhật bài viết
const updatePost = async (
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
  try {
    await post.updatePost(
      postId,
      type_id,
      title,
      content,
      user_id,
      department_id,
      floor,
      room_id,
      expired_at
    );
    return { message: "Post updated successfully" };
  } catch (error) {
    throw new Error("Error updating post: " + error.message);
  }
};

// Xóa bài viết
const deletePost = async (postId) => {
  try {
    await post.deletePost(postId);
    return { message: "Post deleted successfully" };
  } catch (error) {
    throw new Error("Error deleting post: " + error.message);
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost, // Xuất khẩu hàm cập nhật
  deletePost, // Xuất khẩu hàm xóa
};
