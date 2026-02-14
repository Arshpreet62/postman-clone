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

    const allRequests = await RequestHistory.find({ user: auth.id });

    const totalRequests = allRequests.length;
    const successfulRequests = allRequests.filter(
      (r: any) => r.response.status >= 200 && r.response.status < 300,
    ).length;
    const failedRequests = totalRequests - successfulRequests;
    const successRate =
      totalRequests > 0
        ? ((successfulRequests / totalRequests) * 100).toFixed(2)
        : 0;

    const methodBreakdown: Record<string, number> = {};
    const statusBreakdown: Record<string, number> = {};

    allRequests.forEach((req: any) => {
      methodBreakdown[req.method] = (methodBreakdown[req.method] || 0) + 1;
      statusBreakdown[req.response.status] =
        (statusBreakdown[req.response.status] || 0) + 1;
    });

    return NextResponse.json({
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate,
      methodBreakdown,
      statusBreakdown,
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 },
    );
  }
}
