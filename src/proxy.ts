import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";

export async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isAdminPath = path.startsWith("/admin");
    const isLoginPath = path === "/admin/login";

    const token = request.cookies.get("admin-auth")?.value;
    const session = token ? await verifySession(token) : null;
    const isAuthenticated = !!session;

    // If trying to access admin routes (except login) and not authenticated
    if (isAdminPath && !isLoginPath && !isAuthenticated) {
        const redirectUrl = new URL("/admin/login", request.url);
        redirectUrl.searchParams.set("redirect", path);
        return NextResponse.redirect(redirectUrl);
    }

    // If trying to access login page and already authenticated
    if (isLoginPath && isAuthenticated) {
        return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/admin/:path*",
};
