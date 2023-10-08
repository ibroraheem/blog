"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.addComment = exports.editPost = exports.deletePost = exports.getPostsByUser = exports.createPost = exports.getPostById = exports.getAllPosts = void 0;
const post_1 = require("../models/post");
const getAllPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield post_1.Post.find()
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
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Unable to fetch posts" });
    }
});
exports.getAllPosts = getAllPosts;
const getPostById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const post = yield post_1.Post.findById(id)
            .populate("author", "username")
            .populate({
            path: "comments",
            populate: { path: "author", select: "username" },
        });
        if (!post)
            return res.status(404).send("No such post");
        post.views += 1;
        yield post.save();
        res.status(200).json(post);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error while getting the post" });
    }
});
exports.getPostById = getPostById;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, content, category, tags } = req.body;
    try {
        const author = req.user.userId;
        const newPost = new post_1.Post({
            title,
            author: author,
            content,
            category,
            tags,
        });
        yield newPost.save();
        res.status(200).json({ message: "Success", post: newPost });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error while creating post" });
    }
});
exports.createPost = createPost;
const getPostsByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.query.id || null;
    try {
        const posts = yield post_1.Post.find()
            .where("author")
            .equals(`${userId}`)
            .sort("-createdAt")
            .populate({
            path: "comments",
            populate: { path: "author", select: "username" },
        });
        res.status(200).json({ posts });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error });
    }
});
exports.getPostsByUser = getPostsByUser;
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const userId = req.user._id;
        yield post_1.Post.deleteOne({ _id: id }).where("author").equals(`${userId}`);
        res.status(200).json({ message: "Deleted" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error });
    }
});
exports.deletePost = deletePost;
const editPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const id = req.params.id;
    const userId = req.user._id;
    try {
        const updatedPost = yield post_1.Post.findByIdAndUpdate(id, {
            title: (_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.title) !== null && _b !== void 0 ? _b : null,
            content: (_d = (_c = req.body) === null || _c === void 0 ? void 0 : _c.content) !== null && _d !== void 0 ? _d : null,
            category: (_f = (_e = req.body) === null || _e === void 0 ? void 0 : _e.category) !== null && _f !== void 0 ? _f : null,
            tags: (_h = (_g = req.body) === null || _g === void 0 ? void 0 : _g.tags) !== null && _h !== void 0 ? _h : [],
        })
            .where("author")
            .equals(`${userId}`);
        res.status(201).json({ message: "Updated", post: updatedPost });
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Error: " + error);
    }
});
exports.editPost = editPost;
const addComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { content } = req.body;
    try {
        const newComment = new post_1.Comment({
            author: req.user.id,
            content: content,
            post: id,
        });
        yield newComment.save();
        const post = yield post_1.Post.findById(id);
        if (!post)
            throw Error("No such post");
        yield post.save();
    }
    catch (error) {
        res.status(500).send("Error: " + error);
    }
});
exports.addComment = addComment;
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const commentId = req.params.id;
    try {
        const comment = yield post_1.Comment.findByIdAndRemove(commentId);
        if (!comment)
            throw Error("No such comment");
        res.status(200).json({ message: "Comment deleted" });
    }
    catch (error) {
        res.status(500).send("Error: " + error);
    }
});
exports.deleteComment = deleteComment;
