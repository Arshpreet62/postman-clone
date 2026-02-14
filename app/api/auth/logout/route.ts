import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ message: "Logged out successfully." });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
