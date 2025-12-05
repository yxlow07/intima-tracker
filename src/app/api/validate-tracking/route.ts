import { getActivityByToken } from "@/lib/activity";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json({ valid: false, error: "Token is required" }, { status: 400 });
        }

        const activity = getActivityByToken(token);

        if (activity) {
            return NextResponse.json({ valid: true });
        } else {
            return NextResponse.json({ valid: false });
        }
    } catch (error) {
        console.error("Error validating tracking token:", error);
        return NextResponse.json({ valid: false, error: "Server error" }, { status: 500 });
    }
}
