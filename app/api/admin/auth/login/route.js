import { dbConnect } from "@/lib/dbConnect";
import User from "@/model/User.js";
import { createToken } from "@/lib/auth";
import { serialize } from "cookie";

export async function POST(req) {
	await dbConnect();
	const { email, password } = await req.json();

	const user = await User.findOne({
		email
	});

	if (!user || !(await user.comparePassword(password))) {
		return Response.json({ message: "Invalid credentials" }, { status: 401 });
	}

	const token = createToken(user);
	const cookie = serialize("auth_token", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		path: "/",
		maxAge: 60 * 60 * 24 * 7, // 7 days
	});

	return new Response(JSON.stringify({ message: "Login successful" }), {
		status: 200,
		headers: { "Set-Cookie": cookie },
	});
}
