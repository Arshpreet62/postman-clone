import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest, signToken } from "@/app/lib/auth";
import dbConnect from "@/app/lib/db";
import { User } from "@/app/lib/models";

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(auth.id);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const newToken = signToken({
      id: user._id.toString(),
      email: user.email,
    });

    return NextResponse.json({ token: newToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
