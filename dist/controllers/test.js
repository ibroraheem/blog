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
const supertest_1 = __importDefault(require("supertest"));
const jest_1 = __importDefault(require("jest"));
const index_1 = __importDefault(require("../index")); // Make sure you import your Express app instance
const post_1 = require("../models/post");
// Mocking mongoose Post model functions for isolated unit testing
jest_1.default.mock("../models/post");
beforeEach(() => {
    jest_1.default.clearAllMocks();
});
describe("Post Controller", () => {
    describe("getAllPosts", () => {
        it("should fetch all posts successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            post_1.Post.find.mockResolvedValue([]);
            const res = yield (0, supertest_1.default)(index_1.default).get("/path-to-getAllPosts-endpoint");
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Post fetched successfully!");
        }));
        // Add more test scenarios, e.g., when the cache hits or an error occurs
    });
    describe("createPost", () => {
        it("should create a post successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            const postData = {
                title: "Test Title",
                content: "Test content",
                category: "Test category",
                tags: ["tag1", "tag2"],
            };
            post_1.Post.prototype.save.mockResolvedValue(postData);
            const res = yield (0, supertest_1.default)(index_1.default)
                .post("/path-to-createPost-endpoint")
                .send(postData);
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Success");
            expect(res.body.post.title).toBe(postData.title);
        }));
        // Add more test scenarios, e.g., when an error occurs
    });
    describe("Post Controller", () => {
        // ... previous tests ...
        describe("getPostById", () => {
            it("should fetch a post by ID successfully", () => __awaiter(void 0, void 0, void 0, function* () {
                const mockPost = {
                    _id: "1234",
                    title: "Test Title",
                    content: "Test content",
                    author: "Test Author",
                    comments: [],
                    likes: [],
                };
                post_1.Post.findById.mockResolvedValue(mockPost);
                const res = yield (0, supertest_1.default)(index_1.default).get("/path-to-getPostById-endpoint/1234");
                expect(res.status).toBe(200);
                expect(res.body.title).toBe(mockPost.title);
            }));
            it("should return 404 if post not found", () => __awaiter(void 0, void 0, void 0, function* () {
                post_1.Post.findById.mockResolvedValue(null);
                const res = yield (0, supertest_1.default)(index_1.default).get("/path-to-getPostById-endpoint/invalidId");
                expect(res.status).toBe(404);
            }));
        });
        describe("getPostsByUser", () => {
            it("should fetch posts by a user successfully", () => __awaiter(void 0, void 0, void 0, function* () {
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
                post_1.Post.find.mockResolvedValue(mockPosts);
                const res = yield (0, supertest_1.default)(index_1.default).get("/path-to-getPostsByUser-endpoint/testUserId");
                expect(res.status).toBe(200);
                expect(res.body.posts.length).toBe(2);
                expect(res.body.posts[0].title).toBe(mockPosts[0].title);
            }));
        });
        describe("deletePost", () => {
            it("should delete a post successfully", () => __awaiter(void 0, void 0, void 0, function* () {
                post_1.Post.deleteOne.mockResolvedValue({ deletedCount: 1 });
                const res = yield (0, supertest_1.default)(index_1.default).delete("/path-to-deletePost-endpoint/1234");
                expect(res.status).toBe(200);
                expect(res.body.message).toBe("Deleted");
            }));
        });
        describe("editPost", () => {
            it("should edit a post successfully", () => __awaiter(void 0, void 0, void 0, function* () {
                const updatedData = {
                    title: "Updated Title",
                    content: "Updated content",
                };
                post_1.Post.findByIdAndUpdate.mockResolvedValue(updatedData);
                const res = yield (0, supertest_1.default)(index_1.default)
                    .put("/path-to-editPost-endpoint/1234")
                    .send(updatedData);
                expect(res.status).toBe(201);
                expect(res.body.post.title).toBe(updatedData.title);
            }));
        });
    });
});
