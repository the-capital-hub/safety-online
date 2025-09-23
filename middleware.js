// import { NextResponse } from "next/server";
// import { decodeJwt } from "jose";

// export async function middleware(req) {
// 	const { pathname } = req.nextUrl;

// 	const userToken = req.cookies.get("auth_token")?.value;
// 	const adminToken = req.cookies.get("admin_token")?.value;
// 	const sellerToken = req.cookies.get("seller-auth-token")?.value;

// 	if (pathname === "/login") {
// 		if (userToken) {
// 			return NextResponse.redirect(new URL("/account/profile", req.url));
// 		}
// 		return NextResponse.next();
// 	}

// 	if (pathname === "/admin/login") {
// 		if (adminToken) {
// 			return NextResponse.redirect(new URL("/admin/dashboard", req.url));
// 		}
// 		return NextResponse.next();
// 	}

// 	if (pathname.startsWith("/admin")) {
// 		if (!adminToken) {
// 			return NextResponse.redirect(new URL("/admin/login", req.url));
// 		}

// 		try {
// 			decodeJwt(adminToken);
// 			return NextResponse.next();
// 		} catch {
// 			return NextResponse.redirect(new URL("/admin/login", req.url));
// 		}
// 	}

// 	if (pathname.startsWith("/account") || pathname.startsWith("/dashboard")) {
// 		if (!userToken) {
// 			return NextResponse.redirect(new URL("/login", req.url));
// 		}

// 		try {
// 			decodeJwt(userToken);
// 			return NextResponse.next();
// 		} catch {
// 			return NextResponse.redirect(new URL("/login", req.url));
// 		}
// 	}

// 	return NextResponse.next();
// }

// export const config = {
// 	matcher: ["/dashboard/:path*", "/account/:path*", "/admin/:path*"],
// };

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
		return NextResponse.redirect(new URL("/seller", req.url));
	}

	// Guarded sections
	// Admin-only
	if (pathname.startsWith("/admin")) {
		if (!adminToken || !isValidJWT(adminToken)) {
			return NextResponse.redirect(new URL("/admin/login", req.url));
		}
	}

	// User account areas
	if (pathname.startsWith("/account") || pathname.startsWith("/dashboard")) {
		if (!userToken || !isValidJWT(userToken)) {
			return NextResponse.redirect(new URL("/login", req.url));
		}
	}

	// Seller-only
	if (pathname.startsWith("/seller/dashboard")) {
		// Allow /seller/login without token
		if (pathname === "/seller/login") {
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
