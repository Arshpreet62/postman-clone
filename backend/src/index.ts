import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
dotenv.config();
import authRoutes from "./authroutes";
import RequestHistory from "./requestHistory";
import { authenticateJWT } from "./authMiddleware";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "https://postman-clone-seven.vercel.app",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
  }),
);

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Error:", err);
  });

app.use("/api/auth", authRoutes);

app.post("/api/request", async (req, res) => {
  const { url, method, headers, body } = req.body;

  let isAuthenticated = false;
  let userId: string | null = null;

  // Authenticate JWT
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      isAuthenticated = true;
      userId = decoded.id;
    } catch {
      isAuthenticated = false;
    }
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body:
        method !== "GET" && method !== "HEAD"
          ? JSON.stringify(body)
          : undefined,
    });

    const contentType = response.headers.get("content-type");
    const responseData = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    if (isAuthenticated && userId) {
      await new RequestHistory({
        user: userId,
        endpoint: url,
        method: method,
        timestamp: new Date(),
        request: { headers, body },
        response: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseData,
        },
      }).save();
    }

    res.json({
      request: { url, method, headers, body: method !== "GET" ? body : "" },
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseData,
      },
      savedToHistory: isAuthenticated,
    });
  } catch (err) {
    const error = err as Error;

    if (isAuthenticated && userId) {
      await new RequestHistory({
        user: userId,
        endpoint: url,
        method,
        timestamp: new Date(),
        request: { headers, body },
        response: {
          status: 500,
          statusText: "Request Failed",
          headers: {},
          body: { error: error.message },
        },
      }).save();
    }

    res.status(500).json({
      error: "Request failed",
      details: error.message,
      savedToHistory: isAuthenticated,
    });
  }
});
app.get("/api/history", authenticateJWT, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    console.log("Fetching history for user:", userId);

    const historyData = await RequestHistory.find({ user: userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    console.log("Found history items:", historyData.length);

    // Send the complete data structure - let frontend decide what to use
    const history = historyData.map((item) => ({
      _id: item._id, // ✅ Fixed: underscore not asterisk
      endpoint: item.endpoint,
      method: item.method,
      timestamp: item.timestamp,
      user: item.user,
      request: {
        headers: item.request.headers,
        body: item.request.body,
      },
      response: {
        status: item.response.status,
        statusText: item.response.statusText,
        headers: item.response.headers,
        body: item.response.body,
      },
    }));

    const total = await RequestHistory.countDocuments({ user: userId });

    res.json({
      success: true, // Add success flag
      history,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRequests: total,
        limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    const error = err as Error;
    console.error("History fetch error:", error);
    res.status(500).json({
      success: false, // Add success flag for errors too
      error: "Failed to fetch request history",
      details: error.message,
    });
  }
});

app.get("/api/history/:id", authenticateJWT, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const requestId = req.params.id;

    const request = await RequestHistory.findOne({
      _id: requestId,
      user: userId,
    });

    if (!request) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    res.json({ request });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({
      error: "Failed to fetch request",
      details: error.message,
    });
  }
});

app.delete("/api/history/:id", authenticateJWT, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const requestId = req.params.id;

    const deletedRequest = await RequestHistory.findOneAndDelete({
      _id: requestId,
      user: userId,
    });

    if (!deletedRequest) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    res.json({ message: "Request deleted successfully" });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({
      error: "Failed to delete request",
      details: error.message,
    });
  }
});

app.delete("/api/history", authenticateJWT, async (req, res) => {
  try {
    const userId = (req as any).user.id;

    const result = await RequestHistory.deleteMany({ user: userId });

    res.json({
      message: "All request history cleared",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({
      error: "Failed to clear request history",
      details: error.message,
    });
  }
});

app.get("/api/stats", authenticateJWT, async (req, res) => {
  try {
    const userId = (req as any).user.id;

    const stats = await RequestHistory.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          successfulRequests: {
            $sum: { $cond: [{ $lt: ["$response.status", 400] }, 1, 0] },
          },
          failedRequests: {
            $sum: { $cond: [{ $gte: ["$response.status", 400] }, 1, 0] },
          },
          methodBreakdown: { $push: "$method" },
          statusBreakdown: { $push: "$response.status" },
        },
      },
      {
        $project: {
          _id: 0,
          totalRequests: 1,
          successfulRequests: 1,
          failedRequests: 1,
          successRate: {
            $multiply: [
              { $divide: ["$successfulRequests", "$totalRequests"] },
              100,
            ],
          },
          methodBreakdown: 1,
          statusBreakdown: 1,
        },
      },
    ]);

    if (stats.length === 0) {
      res.json({
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        successRate: 0,
        methodBreakdown: {},
        statusBreakdown: {},
      });
      return;
    }

    const methodCounts = stats[0].methodBreakdown.reduce(
      (acc: any, method: string) => {
        acc[method] = (acc[method] || 0) + 1;
        return acc;
      },
      {},
    );

    const statusCounts = stats[0].statusBreakdown.reduce(
      (acc: any, status: number) => {
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {},
    );

    res.json({
      ...stats[0],
      methodBreakdown: methodCounts,
      statusBreakdown: statusCounts,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({
      error: "Failed to fetch statistics",
      details: error.message,
    });
  }
});

const clientDistPath = path.resolve(__dirname, "../../client/dist");
app.use(express.static(clientDistPath));
app.get(/.*/, (req, res) => {
  if (req.path.startsWith("/api")) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const indexPath = path.join(clientDistPath, "index.html");
  if (!fs.existsSync(indexPath)) {
    res.status(404).json({
      error: "Frontend not built",
      hint: "Run npm run build in the client folder",
    });
    return;
  }
  res.sendFile(indexPath);
});

export default app;
