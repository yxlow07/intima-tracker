import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (password === process.env.ADMIN_PASSWORD) {
    const token = await signSession({ role: "admin" });

    (await cookies()).set("admin-auth", token, {
      httpOnly: true,
      secure: process.env.SECURE_COOKIES === "true",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
    return NextResponse.json({ message: "Login successful" }, { status: 200 });
  } else {
    return NextResponse.json({ message: "Invalid password" }, { status: 401 });
  }
}
