import User from "@/models/User";
import { dbConnect } from "@/lib/dbConnect";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req) {
	await dbConnect();
	const { token, newPassword } = await req.json();

	try {
		const decoded = verifyToken(token);
		const user = await User.findById(decoded.id);
		if (!user)
			return Response.json({ message: "Invalid token" }, { status: 401 });

		user.password = await bcrypt.hash(newPassword, 12);
		await user.save();

		return Response.json({ message: "Password updated successfully" });
	} catch (err) {
		return Response.json(
			{ message: "Token expired or invalid" },
			{ status: 401 }
		);
	}
}
