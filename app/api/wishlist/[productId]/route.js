import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect.js";
import Wishlist from "@/model/Wishlist.js";
import jwt from "jsonwebtoken";

// DELETE - Remove product from wishlist
export async function DELETE(request, { params }) {
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
		console.log("decoded", decoded);
		const userId = decoded.id;

		const { productId } = params;
		if (!productId) {
			return NextResponse.json(
				{ message: "Product ID is required" },
				{ status: 400 }
			);
		}

		const wishlist = await Wishlist.findOne({ user: userId });
		if (!wishlist) {
			return NextResponse.json(
				{ message: "Wishlist not found" },
				{ status: 404 }
			);
		}

		// Remove product from wishlist
		const initialLength = wishlist.products.length;
		wishlist.products = wishlist.products.filter(
			(item) => item.product.toString() !== productId
		);

		if (wishlist.products.length === initialLength) {
			return NextResponse.json(
				{ message: "Product not found in wishlist" },
				{ status: 404 }
			);
		}

		await wishlist.save();

		// Populate and return updated wishlist
		const populatedWishlist = await Wishlist.findById(wishlist._id)
			.populate({
				path: "products.product",
				model: "Product",
				select: "title description price salePrice images inStock category",
			})
			.exec();

		return NextResponse.json({
			success: true,
			message: "Product removed from wishlist",
			wishlist: populatedWishlist,
		});
	} catch (error) {
		console.error("Remove from wishlist error:", error);
		return NextResponse.json(
			{ message: "Failed to remove product from wishlist" },
			{ status: 500 }
		);
	}
}
