import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Error:", err);
  });

app.get("/", (req, res) => {
  res.send("🚀 Backend is up and running!");
});

app.post("/api/request", async (req, res) => {
  const { url, method, headers, body } = req.body;
  try {
    const response = await fetch(url, {
      method,
      headers,
      body:
        method !== "GET" && method !== "HEAD"
          ? JSON.stringify(body)
          : undefined,
    });
    const data = await response.json();

    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      body: data,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({
      error: "request failed",
      details: error.message,
    });
  }
});
