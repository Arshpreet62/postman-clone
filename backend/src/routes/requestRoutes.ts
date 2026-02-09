import { Router } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import RequestHistory from "../requestHistory";
import { authenticateJWT } from "../authMiddleware";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { validate, requestSchema } from "../middleware/validation";
import env from "../config/env";
import logger from "../config/logger";

const router = Router();

// Make API request
router.post(
  "/request",
  validate(requestSchema),
  asyncHandler(async (req, res) => {
    const { url, method, headers, body } = req.body;

    let isAuthenticated = false;
    let userId: string | null = null;

    // Optional authentication - check if user is logged in
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
        isAuthenticated = true;
        userId = decoded.id;
      } catch (err) {
        logger.warn("Invalid token provided for request", { url, method });
        // Don't fail - just don't save to history
      }
    }

    // Convert header array to object
    const headerObj: Record<string, string> = {};
    if (headers && Array.isArray(headers)) {
      headers.forEach((h: { key: string; value: string }) => {
        if (h.key && h.value) {
          headerObj[h.key] = h.value;
        }
      });
    }

    // Make the actual API request
    try {
      const startTime = Date.now();

      const response = await fetch(url, {
        method,
        headers: headerObj,
        body:
          method !== "GET" && method !== "HEAD" && body
            ? JSON.stringify(body)
            : undefined,
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      const duration = Date.now() - startTime;

      const contentType = response.headers.get("content-type");
      let responseData: any;

      try {
        if (contentType?.includes("application/json")) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }
      } catch (parseError) {
        responseData = await response.text();
      }

      const responseHeaders = Object.fromEntries(response.headers.entries());

      // Save to history if authenticated
      if (isAuthenticated && userId) {
        try {
          await new RequestHistory({
            user: userId,
            endpoint: url,
            method: method,
            timestamp: new Date(),
            request: { headers: headerObj, body },
            response: {
              status: response.status,
              statusText: response.statusText,
              headers: responseHeaders,
              body: responseData,
            },
          }).save();
        } catch (saveError) {
          logger.error("Failed to save request to history:", saveError);
          // Don't fail the request if history save fails
        }
      }

      res.json({
        success: true,
        request: {
          url,
          method,
          headers: headerObj,
          body: method !== "GET" ? body : "",
        },
        response: {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          body: responseData,
        },
        savedToHistory: isAuthenticated,
        duration,
      });
    } catch (err: any) {
      const error = err as Error;

      // Log failed request
      if (isAuthenticated && userId) {
        try {
          await new RequestHistory({
            user: userId,
            endpoint: url,
            method,
            timestamp: new Date(),
            request: { headers: headerObj, body },
            response: {
              status: 500,
              statusText: "Request Failed",
              headers: {},
              body: { error: error.message },
            },
          }).save();
        } catch (saveError) {
          logger.error("Failed to save failed request to history:", saveError);
        }
      }

      throw new AppError(
        error.message.includes("aborted")
          ? "Request timeout - the server took too long to respond"
          : `Request failed: ${error.message}`,
        500,
      );
    }
  }),
);

// Get request history with pagination
router.get(
  "/history",
  authenticateJWT,
  asyncHandler(async (req, res) => {
    const userId = (req as any).user.id;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit as string) || 10),
    );
    const skip = (page - 1) * limit;

    logger.debug(`Fetching history for user: ${userId}`, { page, limit });

    const [historyData, total] = await Promise.all([
      RequestHistory.find({ user: userId })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      RequestHistory.countDocuments({ user: userId }),
    ]);

    const history = historyData.map((item) => ({
      _id: item._id,
      endpoint: item.endpoint,
      method: item.method,
      timestamp: item.timestamp,
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

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      history,
      pagination: {
        currentPage: page,
        totalPages,
        totalRequests: total,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  }),
);

// Get single request from history
router.get(
  "/history/:id",
  authenticateJWT,
  asyncHandler(async (req, res) => {
    const userId = (req as any).user.id;
    const requestId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      throw new AppError("Invalid request ID", 400);
    }

    const request = await RequestHistory.findOne({
      _id: requestId,
      user: userId,
    });

    if (!request) {
      throw new AppError("Request not found", 404);
    }

    res.json({ success: true, request });
  }),
);

// Delete single request from history
router.delete(
  "/history/:id",
  authenticateJWT,
  asyncHandler(async (req, res) => {
    const userId = (req as any).user.id;
    const requestId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      throw new AppError("Invalid request ID", 400);
    }

    const deletedRequest = await RequestHistory.findOneAndDelete({
      _id: requestId,
      user: userId,
    });

    if (!deletedRequest) {
      throw new AppError("Request not found", 404);
    }

    res.json({
      success: true,
      message: "Request deleted successfully",
    });
  }),
);

// Clear all history for user
router.delete(
  "/history",
  authenticateJWT,
  asyncHandler(async (req, res) => {
    const userId = (req as any).user.id;

    const result = await RequestHistory.deleteMany({ user: userId });

    res.json({
      success: true,
      message: "All request history cleared",
      deletedCount: result.deletedCount,
    });
  }),
);

// Get statistics
router.get(
  "/stats",
  authenticateJWT,
  asyncHandler(async (req, res) => {
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
      return res.json({
        success: true,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        successRate: 0,
        methodBreakdown: {},
        statusBreakdown: {},
      });
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
      success: true,
      ...stats[0],
      methodBreakdown: methodCounts,
      statusBreakdown: statusCounts,
    });
  }),
);

export default router;
