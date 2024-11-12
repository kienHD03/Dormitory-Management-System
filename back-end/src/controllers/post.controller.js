const PostService = require("../services/post.service");
const { successResponse, errorResponse } = require("../utils/response");

const createPost = async (req, res) => {
  try {
    const {
      type_id,
      title,
      content,
      user_id,
      department_id,
      floor,
      room_id,
      expired_at,
    } = req.body; // Lấy các trường từ body

    // Kiểm tra đầu vào
    if (!title) {
      const error = new Error("Title is required");
      error.status = 400;
      throw error;
    }
    if (!content) {
      const error = new Error("Content is required");
      error.status = 400;
      throw error;
    }
    if (!user_id) {
      const error = new Error("User ID is required");
      error.status = 400;
      throw error;
    }

    // Gọi dịch vụ để tạo một bài viết
    const newPost = await PostService.createPost(
      type_id,
      title,
      content,
      user_id,
      department_id,
      floor,
      room_id,
      expired_at
    );

    // Phản hồi thành công với chi tiết bài viết đã tạo
    return successResponse({
      res,
      message: "Post created successfully",
      data: newPost, // Bao gồm bài viết đã tạo trong phản hồi nếu cần
    });
  } catch (e) {
    // Phản hồi lỗi
    return errorResponse({
      res,
      message: e.message,
      status: e.status || 500,
      errors: e.errors || e.message, // Đảm bảo chi tiết lỗi đúng
    });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await PostService.getPosts();
    return successResponse({
      res,
      message: "Get posts successfully",
      data: posts,
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

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      const error = new Error("Post id is required");
      error.status = 400;
      throw error;
    }
    const post = await PostService.getPostById(id);
    return successResponse({
      res,
      message: "Get post by id successfully",
      data: post,
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

// Cập nhật bài viết
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type_id,
      title,
      content,
      user_id,
      department_id,
      floor,
      room_id,
      expired_at,
    } = req.body; // Lấy title, content và các trường khác từ body

    if (!id) {
      const error = new Error("Post id is required");
      error.status = 400;
      throw error;
    }
    if (!title || !content) {
      const error = new Error("Title and content are required");
      error.status = 400;
      throw error;
    }

    // Gọi hàm updatePost từ service với các tham số mới
    await PostService.updatePost(
      id,
      type_id,
      title,
      content,
      user_id,
      department_id,
      floor,
      room_id,
      expired_at
    );

    return successResponse({
      res,
      message: "Post updated successfully",
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

// Xóa bài viết
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      const error = new Error("Post id is required");
      error.status = 400;
      throw error;
    }
    await PostService.deletePost(id); // Gọi hàm deletePost từ service
    return successResponse({
      res,
      message: "Post deleted successfully",
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

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost, // Xuất khẩu hàm cập nhật
  deletePost, // Xuất khẩu hàm xóa
};
