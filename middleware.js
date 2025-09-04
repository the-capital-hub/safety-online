import { NextResponse } from "next/server";
import { decodeJwt } from "jose";

export async function middleware(req) {
	const { pathname } = req.nextUrl;

	const userToken = req.cookies.get("auth_token")?.value;
	const adminToken = req.cookies.get("admin_token")?.value;

	if (pathname === "/login") {
		if (userToken) {
			return NextResponse.redirect(new URL("/account/profile", req.url));
		}
		return NextResponse.next();
	}

	if (pathname === "/admin/login") {
		if (adminToken) {
			return NextResponse.redirect(new URL("/admin/dashboard", req.url));
		}
		return NextResponse.next();
	}

	if (pathname.startsWith("/admin")) {
		if (!adminToken) {
			return NextResponse.redirect(new URL("/admin/login", req.url));
		}

		try {
			decodeJwt(adminToken);
			return NextResponse.next();
		} catch {
			return NextResponse.redirect(new URL("/admin/login", req.url));
		}
	}

	if (pathname.startsWith("/account") || pathname.startsWith("/dashboard")) {
		if (!userToken) {
			return NextResponse.redirect(new URL("/login", req.url));
		}

		try {
			decodeJwt(userToken);
			return NextResponse.next();
		} catch {
			return NextResponse.redirect(new URL("/login", req.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard/:path*", "/account/:path*", "/admin/:path*"],
};
