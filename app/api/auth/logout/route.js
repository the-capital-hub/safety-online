import { serialize } from "cookie";

// Clear all known auth cookies (user, admin, seller) in one go
export async function POST() {
	const headers = new Headers();

	const base = {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		path: "/",
		maxAge: 0,
	};

	headers.append("Set-Cookie", serialize("auth_token", "", base));
	headers.append("Set-Cookie", serialize("admin_token", "", base));
	headers.append("Set-Cookie", serialize("seller-auth-token", "", base));

	return new Response(
		JSON.stringify({ success: true, message: "Logged out" }),
		{
			status: 200,
			headers: {
				"Content-Type": "application/json",
				...Object.fromEntries(headers),
			},
		}
	);
}

// Optional GET for ease of testing from browser
export async function GET() {
	return POST();
}
