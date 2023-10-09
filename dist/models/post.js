"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Like = exports.Comment = exports.Post = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// Post Schema
const postSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255,
    },
    author: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    category: [
        {
            type: String,
            required: true,
        },
    ],
    views: {
        type: Number,
        default: 0,
    },
    tags: [
        {
            type: String,
        },
    ],
    comments: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Comment',
            default: []
        }],
    likes: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Like',
            default: []
        }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});
// Comment Schema
const commentSchema = new mongoose_1.default.Schema({
    post: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
    },
    author: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
// Like Schema
const likeSchema = new mongoose_1.default.Schema({
    post: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
    },
    author: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const Post = mongoose_1.default.model("Post", postSchema);
exports.Post = Post;
const Comment = mongoose_1.default.model("Comment", commentSchema);
exports.Comment = Comment;
const Like = mongoose_1.default.model("Like", likeSchema);
exports.Like = Like;
