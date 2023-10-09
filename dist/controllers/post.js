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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginatedPosts = exports.searchPosts = exports.addLike = exports.deleteComment = exports.addComment = exports.editPost = exports.deletePost = exports.getPostsByUser = exports.createPost = exports.getPostById = exports.getAllPosts = void 0;
const post_1 = require("../models/post");
const notification_1 = __importDefault(require("../models/notification"));
const node_cache_1 = __importDefault(require("node-cache"));
const postCache = new node_cache_1.default({ stdTTL: 3600 });
const getAllPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let cachedPosts = postCache.get("allPosts");
        if (!cachedPosts) {
            const posts = yield post_1.Post.find()
                .select("title content comments likes")
                .populate("author", "username");
            const formattedPosts = posts.map(({ _id, title, content, author, comments = [], likes = [] }) => ({
                id: _id,
                title,
                content,
                author,
                commentsCount: comments.length,
                likesCount: likes.length,
            }));
            postCache.set("allPosts", formattedPosts);
            res
                .status(200)
                .json({ message: "Post fetched successfully!", posts: formattedPosts });
        }
        else {
            res
                .status(200)
                .json({ message: "Post fetched from cache!", posts: cachedPosts });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Unable to fetch posts" });
    }
});
exports.getAllPosts = getAllPosts;
const getPostById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const id = req.params.id;
    try {
        const post = yield post_1.Post.findById(id)
            .populate("author", "username")
            .populate("likes")
            .populate("comments");
        if (!post)
            return res.status(404).send("No such post");
        post.views += 1;
        yield post.save();
        const formattedPost = Object.assign(Object.assign({}, post.toObject()), { commentsCount: ((_a = post.comments) === null || _a === void 0 ? void 0 : _a.length) || 0, likeCount: ((_b = post.likes) === null || _b === void 0 ? void 0 : _b.length) || 0 });
        res.status(200).json(formattedPost);
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
        const newPost = new post_1.Post({
            title,
            author: req.user.id,
            content,
            category: category,
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
    const userId = req.params.userId || null;
    try {
        const posts = yield post_1.Post.find()
            .where("author")
            .equals(`${userId}`)
            .sort("-createdAt")
            .populate({
            path: "comments",
            populate: { path: "author", select: "username" },
        });
        const formattedPosts = posts.map((post) => {
            var _a;
            return (Object.assign(Object.assign({}, post.toObject()), { likeCount: ((_a = post.likes) === null || _a === void 0 ? void 0 : _a.length) || 0, commentsCount: post.comments.length || 0 }));
        });
        res.status(200).json({ posts: formattedPosts });
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
    var _c, _d, _e, _f, _g, _h, _j, _k;
    const id = req.params.id;
    const userId = req.user._id;
    try {
        const updatedPost = yield post_1.Post.findByIdAndUpdate(id, {
            title: (_d = (_c = req.body) === null || _c === void 0 ? void 0 : _c.title) !== null && _d !== void 0 ? _d : null,
            content: (_f = (_e = req.body) === null || _e === void 0 ? void 0 : _e.content) !== null && _f !== void 0 ? _f : null,
            category: (_h = (_g = req.body) === null || _g === void 0 ? void 0 : _g.category) !== null && _h !== void 0 ? _h : null,
            tags: (_k = (_j = req.body) === null || _j === void 0 ? void 0 : _j.tags) !== null && _k !== void 0 ? _k : [],
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
    try {
        const { content } = req.body;
        const postId = req.params.id;
        const userId = req.user.id;
        const comment = new post_1.Comment({
            content,
            post: postId,
            author: userId,
        });
        yield comment.save();
        const post = yield post_1.Post.findById(postId);
        if (post) {
            const notification = new notification_1.default({
                userId: post.author,
                postId: post._id,
                type: "COMMENT",
                message: `Your post titled "${post.title}" has a new comment.`,
            });
            yield notification.save();
        }
        res.status(201).json({ message: "Comment added and notification sent!" });
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
const addLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingLike = yield post_1.Like.findOne({
            post: req.params.postId,
            user: req.user.id,
        });
        const post = yield post_1.Post.findById(req.params.postId);
        if (!existingLike) {
            const like = new post_1.Like({
                author: req.user.id,
                post: req.params.postId,
            });
            yield like.save();
            if (post) {
                const notification = new notification_1.default({
                    userId: post.author,
                    postId: post._id,
                    type: "LIKE",
                    message: `Your post titled "${post.title}" has been liked.`,
                });
                yield notification.save();
            }
            res.status(200).json({ message: "You liked this post" });
        }
        else {
            yield post_1.Like.deleteOne({ _id: existingLike._id });
            if (post) {
                const notification = new notification_1.default({
                    userId: post.author,
                    postId: post._id,
                    type: "UNLIKE",
                    message: `Someone removed their like from your post titled "${post.title}".`,
                });
                yield notification.save();
            }
            res.status(200).json({ message: "You have unliked this post" });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Error:" + error);
    }
});
exports.addLike = addLike;
const searchPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tag, category, keyword } = req.query;
    try {
        let filter = {};
        if (tag)
            filter.tags = tag;
        if (category)
            filter.category = category;
        if (keyword)
            filter.keyword = keyword;
        const posts = yield post_1.Post.find(filter);
        res.status(200).json(posts);
    }
    catch (err) {
        console.log("searchPost", err);
    }
});
exports.searchPosts = searchPosts;
const getPaginatedPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Number(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const posts = yield post_1.Post.find().skip(skip).limit(limit);
        res.status(200).json(posts);
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});
exports.getPaginatedPosts = getPaginatedPosts;
