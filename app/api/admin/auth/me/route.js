import { dbConnect } from "@/lib/dbConnect";
import User from "@/model/User.js";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
	await dbConnect();

	try {
		const cookieStore = await cookies();
		const token = cookieStore.get("admin_token")?.value;

		if (!token) {
			return Response.json({ message: "No token provided" }, { status: 401 });
		}

		const decoded = verifyToken(token);
		const user = await User.findById(decoded.id).select("-password");

		if (!user) {
			return Response.json({ message: "User  not found" }, { status: 404 });
		}

		return Response.json({ user });
	} catch (error) {
		return Response.json({ message: "Invalid token" }, { status: 401 });
	}
}
