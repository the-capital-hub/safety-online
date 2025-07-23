import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export function middleware(req) {
	const token = req.cookies.get("auth_token")?.value;

	try {
		verifyToken(token);
		return NextResponse.next();
	} catch {
		return NextResponse.redirect(new URL("/login", req.url));
	}
}

// Apply to protected routes
export const config = {
	matcher: ["/dashboard/:path*", "/account"],
};
