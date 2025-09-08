import { dbConnect } from "@/lib/dbConnect.js";
import Product from "@/model/Product.js";

export async function DELETE(request) {
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
	const userId = decoded.id;

	try {
		const { productId } = await request.json();

		if (!productId) {
			return Response.json(
				{ success: false, message: "Product ID is required" },
				{ status: 400 }
			);
		}

		const product = await Product.findOneAndDelete({
			_id: productId,
			sellerId: userId,
		});

		if (!product) {
			return Response.json(
				{ success: false, message: "Product not found" },
				{ status: 404 }
			);
		}

		return Response.json({
			success: true,
			message: "Product deleted successfully",
		});
	} catch (error) {
		console.error("Delete product error:", error);
		return Response.json(
			{ success: false, message: "Failed to delete product" },
			{ status: 500 }
		);
	}
}
