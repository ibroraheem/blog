import express from "express";
import { authorizeUser } from "../middlewares/authorize";
import * as post from "../controllers/post";

const router = express.Router();

router.get("/", post.getAllPosts);
router.get("/:id", post.getPostById);
router.get("/user/:userId", post.getPostsByUser);
router.post("/", authorizeUser, post.createPost);
router.delete("/:id", authorizeUser, post.deletePost);
router.put("/:id", authorizeUser, post.editPost);
router.delete("comment/:commentId", authorizeUser, post.deleteComment);
router.post("comment/:postId", authorizeUser, post.addComment);
router.post("/like/:postId", authorizeUser, post.addLike);
router.get("/search", post.searchPosts);
router.get("/paginate", post.getPaginatedPosts);

export default router;
