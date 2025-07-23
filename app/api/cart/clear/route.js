// app/api/cart/clear/route.js

import { dbConnect } from "@/lib/dbConnect.js";
import Cart from "@/model/Cart.js";
import { verifyToken } from "@/lib/auth.js";
import { cookies } from "next/headers";

export async function DELETE() {
	await dbConnect();

	try {
		const cookieStore = cookies();
		const token = cookieStore.get("auth_token")?.value;

		if (!token) {
			return Response.json(
				{ message: "Authentication required" },
				{ status: 401 }
			);
		}

		const decoded = verifyToken(token);

		await Cart.findOneAndUpdate(
			{ user: decoded.id },
			{ products: [], totalPrice: 0, appliedPromo: null }
		);

		return Response.json({ message: "Cart cleared successfully" });
	} catch (error) {
		console.error("Clear cart error:", error);
		return Response.json({ message: "Failed to clear cart" }, { status: 500 });
	}
}
