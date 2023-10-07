import express from "express";
import connectDB from "./config/database";
import morgan from "morgan";
import "dotenv/config";
import userRoutes from "./routes/user";
const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(morgan("combined"));
connectDB();

app.get("/", (req, res) => {
  res.send("Blog API is up and running!!!");
});
app.use("/user", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
