import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect.js";
import Product from "@/model/Product.js";
import Review from "@/model/Review.js";

// Body: { userId,orderId, reviews: [{ productId, rating, title?, comment, images?[] }] }
export async function POST(req) {
	try {
		await dbConnect();
		const body = await req.json();
		const { userId, orderId, reviews } = body || {};

		if (!orderId || !Array.isArray(reviews) || reviews.length === 0) {
			return NextResponse.json(
				{ success: false, message: "Invalid payload" },
				{ status: 400 }
			);
		}

		const created = [];
		for (const r of reviews) {
			if (!r.productId || !r.rating || !r.comment) continue;

			const reviewDoc = await Review.create({
				user: userId ? userId : null,
				rating: Math.max(1, Math.min(5, Number.parseInt(r.rating, 10))),
				comment: r.comment,
				title: r.title,
				images: r.images || [],
				orderId,
			});

			// Attach review to product
			await Product.findByIdAndUpdate(r.productId, {
				$push: { reviews: reviewDoc._id },
			});

			created.push(reviewDoc._id.toString());
		}

		return NextResponse.json(
			{ success: true, count: created.length, reviewIds: created },
			{ status: 201 }
		);
	} catch (e) {
		console.error("[reviews] bulk create error:", e);
		return NextResponse.json(
			{ success: false, message: "Failed to create reviews" },
			{ status: 500 }
		);
	}
}
