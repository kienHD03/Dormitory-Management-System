const express = require("express");
const postController = require("../controllers/post.controller");
const postRouter = express.Router();

postRouter.get("/", postController.getPosts); // Lấy tất cả bài viết
postRouter.get("/:id", postController.getPostById); // Lấy bài viết theo ID
postRouter.post("/", postController.createPost); // Tạo bài viết mới
postRouter.put("/:id", postController.updatePost); // Cập nhật bài viết theo ID
postRouter.delete("/:id", postController.deletePost); // Xóa bài viết theo ID

module.exports = postRouter;
