// app/api/cart/apply-promo/route.js

import { dbConnect } from "@/lib/dbConnect.js";
import Cart from "@/model/Cart.js";
import Promocode from "@/model/Promocode.js";
import { verifyToken } from "@/lib/auth.js";
import { cookies } from "next/headers";

export async function POST(req) {
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
		const { promoCode } = await req.json();

		// Find cart
		const cart = await Cart.findOne({ user: decoded.id }).populate(
			"products.product"
		);
		if (!cart) {
			return Response.json({ message: "Cart not found" }, { status: 404 });
		}

		// Find and validate promo code
		const promo = await Promocode.findOne({
			code: promoCode.toUpperCase(),
			published: true,
			status: "Active",
			startDate: { $lte: new Date() },
			endDate: { $gte: new Date() },
		});

		if (!promo) {
			return Response.json(
				{ message: "Invalid or expired promo code" },
				{ status: 400 }
			);
		}

		// Apply promo code
		cart.appliedPromo = promo.code;
		await cart.save();

		return Response.json({
			message: "Promo code applied successfully",
			cart,
			discount: promo.discount,
		});
	} catch (error) {
		console.error("Apply promo error:", error);
		return Response.json(
			{ message: "Failed to apply promo code" },
			{ status: 500 }
		);
	}
}
