import express from "express";
import connectDB from "./config/database";
import morgan from "morgan";
import "dotenv/config";
import userRoutes from "./routes/user";
import postRoutes from "./routes/post";
const app = express();


export default app
const PORT = process.env.PORT;


app.use(express.json());
app.use(morgan("combined"));
connectDB();

app.get("/", (req, res) => {
  res.send("Blog API is up and running!!!");
});
app.use("/user", userRoutes);
app.use("/post", postRoutes);

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
