import "dotenv/config";
import { prisma } from "./lib/prisma";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import userRoutes from "./routes/users";
import postRoutes from "./routes/posts";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timeStamp: new Date().toISOString(),
    service: "Blog API",
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to blog API",
    version: "1.0.0",
    doc: "/api-docs",
    endpoints: { user: "/api/users", post: "/api/posts" },
  });
});

app.use("/api/users", userRoutes);
app.post("/api/post", postRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
