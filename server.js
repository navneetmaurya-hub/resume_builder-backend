import express from "express";
import cors from "cors";
import "dotenv/config";

import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import resumeRouter from "./routes/resumeRoutes.js";
import aiRouter from "./routes/aiRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// DB connection
connectDB()
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => {
    console.error("MongoDB Connection Failed ❌", err);
    process.exit(1);
  });

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Routes
app.use("/api/users", userRouter);
app.use("/api/resumes", resumeRouter);
app.use("/api/ai", aiRouter);

// Test route
app.get("/api", (req, res) => {
  res.json({ message: "API is working 🚀" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});