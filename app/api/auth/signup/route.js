import { dbConnect } from "@/lib/dbConnect";
import User from "@/model/User.js";
import Verification from "@/model/Verification.js";

export async function POST(req) {
	await dbConnect();
	const { email, mobile, password, firstName, lastName } = await req.json();

	// Validation
	if ((!email && !mobile) || !password) {
		return Response.json(
			{ message: "Email or mobile and password required" },
			{ status: 400 }
		);
	}

	// Check if user already exists
	const existingUser = await User.findOne({
		$or: [{ email }, { mobile }],
	});

	if (existingUser) {
		return Response.json({ message: "User already exists" }, { status: 409 });
	}

	// If using email, check if it's verified
	if (email) {
		const verification = await Verification.findOne({ email });

		if (!verification) {
			return Response.json({ message: "Email not verified" }, { status: 403 });
		}

		// Delete verification record after registration
		// await Verification.deleteOne({ email });
	}

	// Create and save new user
	const newUser = new User({ email, mobile, password, firstName, lastName });
	await newUser.save();

	return Response.json({ message: "Registration successful" });
}
