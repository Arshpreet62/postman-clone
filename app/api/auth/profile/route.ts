import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import { User } from "@/app/lib/models";
import { getAuthFromRequest } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(auth.id).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Profile error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
