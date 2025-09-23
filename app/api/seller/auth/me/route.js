import { dbConnect } from "@/lib/dbConnect";
import User from "@/model/User.js";
import jwt from "jsonwebtoken";

export async function GET() {
	await dbConnect();

	try {
		// Using the seller token used across seller APIs
		const token = (await import("next/headers"))
			.cookies()
			.then((c) => c.get("seller-auth-token")?.value);
		const tokenValue = await token;

		if (!tokenValue) {
			return Response.json({ message: "No token provided" }, { status: 401 });
		}

		// Seller token payload uses { userId }
		const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
		const sellerId = decoded?.userId;

		if (!sellerId) {
			return Response.json({ message: "Invalid token" }, { status: 401 });
		}

		const user = await User.findById(sellerId).select("-password");
		if (!user) {
			return Response.json({ message: "Seller not found" }, { status: 404 });
		}

		return Response.json({ user });
	} catch (error) {
		return Response.json({ message: "Invalid token" }, { status: 401 });
	}
}
