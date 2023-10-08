import { Request, Response } from "express";
import { Post, Comment } from "../models/post";

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find()
      .select("title comments")
      .populate("author", "username");

    const formattedPosts = posts.map((post) => {
      return {
        title: post.title,
        author: post.author,
        commentsCount: post.comments.length,
      };
    });

    res.status(200).json(formattedPosts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to fetch posts" });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const post = await Post.findById(id)
      .populate("author", "username")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username" },
      });
    if (!post) return res.status(404).send("No such post");
    post.views += 1;
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error while getting the post" });
  }
};

export const createPost = async (req: Request, res: Response) => {
  const { title, content, category, tags } = req.body;
  try {
    const author = req.user.userId;
    const newPost = new Post({
      title,
      author: author,
      content,
      category,
      tags,
    });
    await newPost.save();
    res.status(200).json({ message: "Success", post: newPost });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error while creating post" });
  }
};

export const getPostsByUser = async (req: Request, res: Response) => {
  const userId = (req.query.id as string | undefined) || null;
  try {
    const posts = await Post.find()
      .where("author")
      .equals(`${userId}`)
      .sort("-createdAt")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username" },
      });
    res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const userId = req.user._id;
    await Post.deleteOne({ _id: id }).where("author").equals(`${userId}`);
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
};

export const editPost = async (req: Request, res: Response) => {
  const id = req.params.id;
  const userId = req.user._id;
  try {
    const updatedPost = await Post.findByIdAndUpdate(id, {
      title: req.body?.title ?? null,
      content: req.body?.content ?? null,
      category: req.body?.category ?? null,
      tags: req.body?.tags ?? [],
    })
      .where("author")
      .equals(`${userId}`);
    res.status(201).json({ message: "Updated", post: updatedPost });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error: " + error);
  }
};

export const addComment = async (req: Request, res: Response) => {
  const id = req.params.id;
  const { content } = req.body;
  try {
    const newComment = new Comment({
      author: req.user.id,
      content: content,
      post: id,
    });
    await newComment.save();
    const post = await Post.findById(id);
    if (!post) throw Error("No such post");
    await post.save();
  } catch (error) {
    res.status(500).send("Error: " + error);
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  const commentId = req.params.id;

  try {
    const comment = await Comment.findByIdAndRemove(commentId);
    if (!comment) throw Error("No such comment");
    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).send("Error: " + error);
  }
};


