import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect.js";
import Subscriber from "@/model/Subscriber";

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const email = searchParams.get("email");

		if (!email) {
			return NextResponse.json(
				{ success: false, message: "Email is required" },
				{ status: 400 }
			);
		}

		await dbConnect();

		const subscriber = await Subscriber.findOne({ email });

		if (!subscriber) {
			return NextResponse.json(
				{ success: false, message: "Email not found in our subscription list" },
				{ status: 404 }
			);
		}

		// Update subscriber status to inactive
		subscriber.isActive = false;
		await subscriber.save();

		return NextResponse.json(
			{ success: true, message: "Successfully unsubscribed from newsletter" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Unsubscribe error:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to unsubscribe. Please try again." },
			{ status: 500 }
		);
	}
}
