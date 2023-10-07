"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("./config/database"));
require("dotenv/config");
const user_1 = __importDefault(require("./routes/user"));
const app = (0, express_1.default)();
const PORT = process.env.PORT;
(0, database_1.default)();
app.get("/", (req, res) => {
    res.send("Blog API is up and running!!!");
});
app.use("/user", user_1.default);
app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`);
});
