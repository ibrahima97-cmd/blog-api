import "dotenv/config";
import { prisma } from "./lib/prisma";
import express, { urlencoded } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { timeStamp } from "node:console";

const app = express();
const PORT = process.env.DATABASE_PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use(express.json());
app.use(urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timeStamp: new Date().toISOString(),
    service: "Blog API",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
