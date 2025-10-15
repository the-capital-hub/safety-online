import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect.js";
import Subscriber from "@/model/Subscriber";
import { sendWelcomeEmail } from "@/lib/newsletter";

export async function POST(request) {
	try {
		await dbConnect();
		const { email } = await request.json();

		// Validate email format
		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return NextResponse.json(
				{ message: "Invalid email address" },
				{ status: 400 }
			);
		}

		// Check if email already subscribed
		const existing = await Subscriber.findOne({ email });
		if (existing) {
			return NextResponse.json(
				{ message: "Already subscribed" },
				{ status: 400 }
			);
		}

		// Save to database
		const subscriber = new Subscriber({ email });
		await subscriber.save();

		// Send confirmation email
		await sendWelcomeEmail(email);

		return NextResponse.json(
			{ message: "Subscribed successfully!" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Newsletter subscription error:", error);
		return NextResponse.json(
			{ message: "Failed to subscribe. Please try again." },
			{ status: 500 }
		);
	}
}
