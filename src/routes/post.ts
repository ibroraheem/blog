import express from "express";
import { authorizeUser } from "../middlewares/authorize";
import * as post from "../controllers/post";

const router = express.Router();

router.get("/", post.getAllPosts);
router.get("/:userId", post.getPostsByUser);
router.post("/", authorizeUser, post.createPost);
router.delete("/:id", authorizeUser, post.deletePost);
router.put("/:id", authorizeUser, post.editPost);
router.delete("/:commentId", authorizeUser, post.deleteComment);
router.post("/:postId", authorizeUser, post.addComment);
export default router;
