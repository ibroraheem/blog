import request from "supertest";
import app from "../index";
import { Post } from "../models/post";

// Mocking mongoose Post model functions for isolated unit testing
jest.mock("../models/post");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Post Controller", () => {
  describe("getAllPosts", () => {
    it("should fetch all posts successfully", async () => {
      (Post.find as jest.MockedFunction<typeof Post.find>).mockResolvedValue([]);

      const res = await request(app).get("/post");

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Post fetched successfully!");
    });
  });

  describe("createPost", () => {
    it("should create a post successfully", async () => {
      const postData = {
        title: "Test Title",
        content: "Test content",
        category: "Test category",
        tags: ["tag1", "tag2"],
      };
      (Post.prototype.save as jest.MockedFunction<typeof Post.prototype.save>).mockResolvedValue(postData);

      const res = await request(app)
        .post("/post")
        .send(postData);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Success");
      expect(res.body.post.title).toBe(postData.title);
    });
  });

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
      (Post.findById as jest.MockedFunction<typeof Post.findById>).mockResolvedValue(mockPost);

      const res = await request(app).get("/post/1234");

      expect(res.status).toBe(200);
      expect(res.body.title).toBe(mockPost.title);
    });

    it("should return 404 if post not found", async () => {
      (Post.findById as jest.MockedFunction<typeof Post.findById>).mockResolvedValue(null);

      const res = await request(app).get("/path-to-getPostById-endpoint/invalidId");

      expect(res.status).toBe(404);
    });
  });

  // ... And so on for the rest of your tests. Follow the same pattern.
});
