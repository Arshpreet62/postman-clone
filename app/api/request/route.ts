import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import { RequestHistory } from "@/app/lib/models";
import { getAuthFromRequest } from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  const { url, method, headers, body } = await req.json();

  let auth = getAuthFromRequest(req);
  let userId: string | null = auth?.id || null;

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

    if (userId) {
      await dbConnect();
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

    return NextResponse.json({
      request: { url, method, headers, body: method !== "GET" ? body : "" },
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseData,
      },
      savedToHistory: !!userId,
    });
  } catch (error) {
    const err = error as Error;

    if (userId) {
      await dbConnect();
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
          body: { error: err.message },
        },
      }).save();
    }

    return NextResponse.json(
      {
        error: "Request failed",
        details: err.message,
        savedToHistory: !!userId,
      },
      { status: 500 },
    );
  }
}
