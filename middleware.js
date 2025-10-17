// Unified middleware for user, admin, and seller auth gating
import { NextResponse } from "next/server";
import { decodeJwt } from "jose";

// Helpers
function isValidJWT(token) {
	if (!token) return false;
	try {
		decodeJwt(token);
		return true;
	} catch {
		return false;
	}
}

const ADMIN_PUBLIC_PATHS = ["/admin/login", "/admin/signup"];

export function middleware(req) {
        const { pathname } = req.nextUrl;

	// Read tokens
	const userToken = req.cookies.get("auth_token")?.value;
	const adminToken = req.cookies.get("admin_token")?.value;
	const sellerToken = req.cookies.get("seller-auth-token")?.value;

	// Prepare to forward decoded IDs to downstream
	const requestHeaders = new Headers(req.headers);

	if (isValidJWT(userToken)) {
		try {
			const payload = decodeJwt(userToken);
			if (payload?.id) requestHeaders.set("x-user-id", String(payload.id));
			requestHeaders.set("x-auth-role-user", "1");
		} catch {}
	}
	if (isValidJWT(adminToken)) {
		try {
			const payload = decodeJwt(adminToken);
			if (payload?.id) requestHeaders.set("x-admin-id", String(payload.id));
			requestHeaders.set("x-auth-role-admin", "1");
		} catch {}
	}
	if (isValidJWT(sellerToken)) {
		try {
			const payload = decodeJwt(sellerToken);
			// Seller tokens in your app use "userId"
			if (payload?.userId) {
				requestHeaders.set("x-seller-id", String(payload.userId));
			}
			requestHeaders.set("x-auth-role-seller", "1");
		} catch {}
	}

	// Public routes that should redirect away if already authenticated
	if (pathname === "/login" && userToken && isValidJWT(userToken)) {
		return NextResponse.redirect(new URL("/account/profile", req.url));
	}
	if (pathname === "/admin/login" && adminToken && isValidJWT(adminToken)) {
		return NextResponse.redirect(new URL("/admin/dashboard", req.url));
	}
	if (pathname === "/seller/login" && sellerToken && isValidJWT(sellerToken)) {
		return NextResponse.redirect(new URL("/seller/dashboard", req.url));
	}

	// Guarded sections
	// Admin-only
        const isAdminPublicPath = ADMIN_PUBLIC_PATHS.some((path) => pathname.startsWith(path));

        if (pathname.startsWith("/admin") && !isAdminPublicPath) {
                if (!adminToken || !isValidJWT(adminToken)) {
                        return NextResponse.redirect(new URL("/admin/login", req.url));
                }
        }

	// User account areas
	if (pathname.startsWith("/account") || pathname.startsWith("/checkout")) {
		if (!userToken || !isValidJWT(userToken)) {
			return NextResponse.redirect(new URL("/login", req.url));
		}
	}

	// Seller-only
        if (pathname.startsWith("/seller")) {
                const sellerPublicPaths = new Set(["/seller", "/seller/login", "/seller/register"]);

                if (sellerPublicPaths.has(pathname)) {
                        return NextResponse.next({
                                request: { headers: requestHeaders },
                        });
                }

                const pathSegments = pathname.split("/").filter(Boolean);
                const isPublicSellerStorefront =
                        pathSegments.length === 2 &&
                        /^[0-9a-fA-F]{24}$/.test(pathSegments[1]);

                if (isPublicSellerStorefront) {
                        return NextResponse.next({
                                request: { headers: requestHeaders },
                        });
                }

                if (!sellerToken || !isValidJWT(sellerToken)) {
                        return NextResponse.redirect(new URL("/seller/login", req.url));
                }
        }

	// Continue with forwarded headers
	return NextResponse.next({
		request: { headers: requestHeaders },
	});
}

export const config = {
	matcher: [
		"/dashboard/:path*",
		"/account/:path*",
		"/admin/:path*",
		"/seller/:path*",
		"/login",
		"/admin/login",
		"/seller/login",
	],
};
