import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect.js";
import Wishlist from "@/model/Wishlist.js";
import Product from "@/model/Product.js";
import jwt from "jsonwebtoken";

// GET - Fetch user's wishlist
export async function GET() {
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
		const userId = decoded.userId;

		const wishlist = await Wishlist.findOne({ user: userId })
			.populate({
				path: "products.product",
				model: "Product",
				select: "title description price salePrice images inStock category",
			})
			.exec();

		if (!wishlist) {
			return NextResponse.json({
				success: true,
				wishlist: { user: userId, products: [] },
			});
		}

		// Filter out products that might have been deleted
		const validProducts = wishlist.products.filter(
			(item) => item.product !== null
		);

		return NextResponse.json({
			success: true,
			wishlist: {
				...wishlist._doc,
				products: validProducts,
			},
		});
	} catch (error) {
		console.error("Wishlist fetch error:", error);
		return NextResponse.json(
			{ message: "Failed to fetch wishlist" },
			{ status: 500 }
		);
	}
}

// POST - Add product to wishlist
export async function POST(request) {
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

		const { productId } = await request.json();
		if (!productId) {
			return NextResponse.json(
				{ message: "Product ID is required" },
				{ status: 400 }
			);
		}

		// Verify product exists
		const product = await Product.findById(productId);
		if (!product) {
			return NextResponse.json(
				{ message: "Product not found" },
				{ status: 404 }
			);
		}

		// Find or create wishlist
		let wishlist = await Wishlist.findOne({ user: userId });

		if (!wishlist) {
			wishlist = new Wishlist({
				user: userId,
				products: [{ product: productId }],
			});
		} else {
			// Check if product already exists in wishlist
			const existingProduct = wishlist.products.find(
				(item) => item.product.toString() === productId
			);

			if (existingProduct) {
				return NextResponse.json(
					{ message: "Product already in wishlist" },
					{ status: 400 }
				);
			}

			wishlist.products.push({ product: productId });
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
			message: "Product added to wishlist",
			wishlist: populatedWishlist,
		});
	} catch (error) {
		console.error("Add to wishlist error:", error);
		if (error.code === 11000) {
			return NextResponse.json(
				{ message: "Product already in wishlist" },
				{ status: 400 }
			);
		}
		return NextResponse.json(
			{ message: "Failed to add product to wishlist" },
			{ status: 500 }
		);
	}
}
