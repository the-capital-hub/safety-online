// app/api/cart/apply-promo/route.js

import { dbConnect } from "@/lib/dbConnect.js";
import Cart from "@/model/Cart.js";
import Promocode from "@/model/Promocode.js";
import { verifyToken } from "@/lib/auth.js";
import { cookies } from "next/headers";

export async function DELETE(req) {
	await dbConnect();

        try {
                const cookieStore = await cookies();
                const token = cookieStore.get("auth_token")?.value;

		if (!token) {
			return Response.json(
				{ message: "Authentication required" },
				{ status: 401 }
			);
		}

		const decoded = verifyToken(token);

		// Find cart
		const cart = await Cart.findOne({ user: decoded.id }).populate(
			"products.product"
		);
		if (!cart) {
			return Response.json({ message: "Cart not found" }, { status: 404 });
		}

		// Remove promo code from cart
		cart.appliedPromo = null;
		await cart.save();

		return Response.json({
			message: "Promo code removed successfully",
			cart,
		});
	} catch (error) {
		console.error("Remove promo code error:", error);
		return Response.json(
			{ message: "Failed to remove promo code" },
			{ status: 500 }
		);
	}
}
