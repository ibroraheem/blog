import { Document } from "mongoose";

export interface IPost extends Document {
  title: string;
  author: string;
  content: string;
  category: string;
  tags: string[];
  comments: string[];
  likes: string[];
  createdAt: Date;
  views: number;
  updatedAt: Date;
}

export interface IComment extends Document {
  post: string;
  author: string;
  content: string;
  createdAt: Date;
}

export interface ILike extends Document {
  post: string;
  user: string;
  createdAt: Date;
}

import mongoose from "mongoose";

// Post Schema
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: []
}],

likes: [{
    type: mongoose.Schema.Types.ObjectId,
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
const commentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
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
const likeSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Post = mongoose.model<IPost>("Post", postSchema);
const Comment = mongoose.model<IComment>("Comment", commentSchema);
const Like = mongoose.model<ILike>("Like", likeSchema);

export { Post, Comment, Like };
