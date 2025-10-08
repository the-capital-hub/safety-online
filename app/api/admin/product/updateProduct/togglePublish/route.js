import { dbConnect } from "@/lib/dbConnect";
import Product from "@/model/Product";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function PUT(request) {
	await dbConnect();

	// Get token from cookies
	const token = request.cookies.get("admin_token")?.value;

	if (!token) {
		return NextResponse.json(
			{ success: false, message: "Unauthorized" },
			{ status: 401 }
		);
	}

	// Verify token
	const decoded = jwt.verify(token, process.env.JWT_SECRET);
	const adminId = decoded.id;

	try {
		const formData = await request.formData();

		// Get productId from formData
		const productId = formData.get("productId");
		console.log(productId);
		if (!productId) {
			return NextResponse.json(
				{ success: false, message: "Product ID is required" },
				{ status: 400 }
			);
		}

		// Find product
		const product = await Product.findOne({
			_id: productId,
		});

		if (!product) {
			return NextResponse.json(
				{ success: false, message: "Product not found" },
				{ status: 404 }
			);
		}

		// Extract product data from formData
		const published = formData.get("published") === "true";

		// Update product fields
		product.published = published;

		await product.save();

		return NextResponse.json({
			success: true,
			message: `Product ${published ? "published" : "drafted"} successfully`,
			product,
		});
	} catch (error) {
		console.error("Product toggle publish error:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to toggle publish product" },
			{ status: 500 }
		);
	}
}
