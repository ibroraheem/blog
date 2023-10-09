import request from "supertest";
import * as jest from "jest";
import app from "../index"; // Make sure you import your Express app instance
import { Post } from "../models/post";

// Mocking mongoose Post model functions for isolated unit testing
jest.mock("../models/post");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Post Controller", () => {
  describe("getAllPosts", () => {
    it("should fetch all posts successfully", async () => {
      (Post.find as jest.Mock).mockResolvedValue([]);

      const res = await request(app).get("/path-to-getAllPosts-endpoint");

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Post fetched successfully!");
    });

    // Add more test scenarios, e.g., when the cache hits or an error occurs
  });

  describe("createPost", () => {
    it("should create a post successfully", async () => {
      const postData = {
        title: "Test Title",
        content: "Test content",
        category: "Test category",
        tags: ["tag1", "tag2"],
      };
      (Post.prototype.save as jest.Mock).mockResolvedValue(postData);

      const res = await request(app)
        .post("/path-to-createPost-endpoint")
        .send(postData);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Success");
      expect(res.body.post.title).toBe(postData.title);
    });

    // Add more test scenarios, e.g., when an error occurs
  });

  describe("Post Controller", () => {
    // ... previous tests ...

    describe("getPostById", () => {
      it("should fetch a post by ID successfully", async () => {
        const mockPost = {
          _id: "1234",
          title: "Test Title",
          content: "Test content",
          author: "Test Author",
          comments: [],
          likes: [],
        };
        (Post.findById as jest.Mock).mockResolvedValue(mockPost);

        const res = await request(app).get(
          "/path-to-getPostById-endpoint/1234"
        );

        expect(res.status).toBe(200);
        expect(res.body.title).toBe(mockPost.title);
      });

      it("should return 404 if post not found", async () => {
        (Post.findById as jest.Mock).mockResolvedValue(null);

        const res = await request(app).get(
          "/path-to-getPostById-endpoint/invalidId"
        );

        expect(res.status).toBe(404);
      });
    });

    describe("getPostsByUser", () => {
      it("should fetch posts by a user successfully", async () => {
        const mockPosts = [
          {
            _id: "1234",
            title: "Test Title 1",
            content: "Test content 1",
          },
          {
            _id: "5678",
            title: "Test Title 2",
            content: "Test content 2",
          },
        ];
        (Post.find as jest.Mock).mockResolvedValue(mockPosts);

        const res = await request(app).get(
          "/path-to-getPostsByUser-endpoint/testUserId"
        );

        expect(res.status).toBe(200);
        expect(res.body.posts.length).toBe(2);
        expect(res.body.posts[0].title).toBe(mockPosts[0].title);
      });
    });

    describe("deletePost", () => {
      it("should delete a post successfully", async () => {
        (Post.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

        const res = await request(app).delete(
          "/path-to-deletePost-endpoint/1234"
        );

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Deleted");
      });
    });

    describe("editPost", () => {
      it("should edit a post successfully", async () => {
        const updatedData = {
          title: "Updated Title",
          content: "Updated content",
        };
        (Post.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedData);

        const res = await request(app)
          .put("/path-to-editPost-endpoint/1234")
          .send(updatedData);

        expect(res.status).toBe(201);
        expect(res.body.post.title).toBe(updatedData.title);
      });
    });
  });
});
