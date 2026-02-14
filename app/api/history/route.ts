import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import { RequestHistory } from "@/app/lib/models";
import { getAuthFromRequest } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const historyData = await RequestHistory.find({ user: auth.id })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const history = historyData.map((item: any) => ({
      _id: item._id,
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

    const total = await RequestHistory.countDocuments({ user: auth.id });

    return NextResponse.json({
      success: true,
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
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch request history",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const result = await RequestHistory.deleteMany({ user: auth.id });

    return NextResponse.json({
      message: "All request history cleared",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Clear history error:", error);
    return NextResponse.json(
      { error: "Failed to clear history" },
      { status: 500 },
    );
  }
}
