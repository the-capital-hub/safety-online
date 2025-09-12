import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect.js";
import Wishlist from "@/model/Wishlist.js";
import jwt from "jsonwebtoken";

// DELETE - Clear entire wishlist
export async function DELETE(request) {
	try {
		await dbConnect();
		// Get token from cookies
		const token = request.cookies.get("auth_token")?.value;

		if (!token) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const userId = decoded.id;

		const wishlist = await Wishlist.findOne({ user: userId });
		if (!wishlist) {
			return NextResponse.json({
				success: true,
				message: "Wishlist already empty",
				wishlist: { user: userId, products: [] },
			});
		}

		// Clear all products from wishlist
		wishlist.products = [];
		await wishlist.save();

		return NextResponse.json({
			success: true,
			message: "Wishlist cleared successfully",
			wishlist: wishlist,
		});
	} catch (error) {
		console.error("Clear wishlist error:", error);
		return NextResponse.json(
			{ message: "Failed to clear wishlist" },
			{ status: 500 }
		);
	}
}
