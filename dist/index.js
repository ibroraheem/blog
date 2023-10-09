"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("./config/database"));
const morgan_1 = __importDefault(require("morgan"));
require("dotenv/config");
const user_1 = __importDefault(require("./routes/user"));
const post_1 = __importDefault(require("./routes/post"));
const app = (0, express_1.default)();
exports.default = app;
const PORT = process.env.PORT;
app.use(express_1.default.json());
app.use((0, morgan_1.default)("combined"));
(0, database_1.default)();
app.get("/", (req, res) => {
    res.send("Blog API is up and running!!!");
});
app.use("/user", user_1.default);
app.use("/post", post_1.default);
app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`);
});
