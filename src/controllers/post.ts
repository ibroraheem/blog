import { Request, Response } from "express";
import { Post, Comment, Like } from "../models/post";
import Notification from "../models/notification";
import NodeCache from "node-cache";
const postCache = new NodeCache({ stdTTL: 3600 });

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    let cachedPosts = postCache.get("allPosts");

    if (!cachedPosts) {
      const posts = await Post.find()
        .select("title content comments likes")
        .populate("author", "username");

      const formattedPosts = posts.map(
        ({ _id, title, content, author, comments = [], likes = [] }) => ({
          id: _id,
          title,
          content,
          author,
          commentsCount: comments.length,
          likesCount: likes.length,
        })
      );

      postCache.set("allPosts", formattedPosts);
      res
        .status(200)
        .json({ message: "Post fetched successfully!", posts: formattedPosts });
    } else {
      res
        .status(200)
        .json({ message: "Post fetched from cache!", posts: cachedPosts });
    }
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
      .populate("likes")
      .populate("comments");

    if (!post) return res.status(404).send("No such post");

    post.views += 1;
    await post.save();

    const formattedPost = {
      ...post.toObject(),
      commentsCount: post.comments?.length || 0,
      likeCount: post.likes?.length || 0,
    };

    res.status(200).json(formattedPost);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error while getting the post" });
  }
};

export const createPost = async (req: Request, res: Response) => {
  const { title, content, category, tags } = req.body;
  try {
    const newPost = new Post({
      title,
      author: req.user.id,
      content,
      category: category,
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
  const userId = (req.params.userId as string | undefined) || null;
  try {
    const posts = await Post.find()
      .where("author")
      .equals(`${userId}`)
      .sort("-createdAt")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username" },
      });

    const formattedPosts = posts.map((post) => ({
      ...post.toObject(),
      likeCount: post.likes?.length || 0,
      commentsCount: post.comments.length || 0,
    }));

    res.status(200).json({ posts: formattedPosts });
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
  try {
    const { content } = req.body;
    const postId = req.params.id;
    const userId = req.user.id;
    const comment = new Comment({
      content,
      post: postId,
      author: userId,
    });
    await comment.save();
    const post = await Post.findById(postId);
    if (post) {
      const notification = new Notification({
        userId: post.author,
        postId: post._id,
        type: "COMMENT",
        message: `Your post titled "${post.title}" has a new comment.`,
      });
      await notification.save();
    }
    res.status(201).json({ message: "Comment added and notification sent!" });
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

export const addLike = async (req: Request, res: Response) => {
  try {
    const existingLike = await Like.findOne({
      post: req.params.postId,
      user: req.user.id,
    });

    const post = await Post.findById(req.params.postId);

    if (!existingLike) {
      const like = new Like({
        author: req.user.id,
        post: req.params.postId,
      });
      await like.save();

      if (post) {
        const notification = new Notification({
          userId: post.author,
          postId: post._id,
          type: "LIKE",
          message: `Your post titled "${post.title}" has been liked.`,
        });
        await notification.save();
      }

      res.status(200).json({ message: "You liked this post" });
    } else {
      await Like.deleteOne({ _id: existingLike._id });

      if (post) {
        const notification = new Notification({
          userId: post.author,
          postId: post._id,
          type: "UNLIKE",
          message: `Someone removed their like from your post titled "${post.title}".`,
        });
        await notification.save();
      }

      res.status(200).json({ message: "You have unliked this post" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error:" + error);
  }
};
export const searchPosts = async (req: Request, res: Response) => {
  const { tag, category, keyword } = req.query;
  try {
    let filter: any = {};
    if (tag) filter.tags = tag;
    if (category) filter.category = category;
    if (keyword) filter.keyword = keyword;
    const posts = await Post.find(filter);
    res.status(200).json(posts);
  } catch (err) {
    console.log("searchPost", err);
  }
};

export const getPaginatedPosts = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const posts = await Post.find().skip(skip).limit(limit);
    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};
