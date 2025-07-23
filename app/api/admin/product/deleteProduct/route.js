import { dbConnect } from "@/lib/dbConnect.js";
import Product from "@/model/Product.js";

export async function DELETE(request) {
	await dbConnect();

	try {
		const { productId } = await request.json();

		if (!productId) {
			return Response.json(
				{ success: false, message: "Product ID is required" },
				{ status: 400 }
			);
		}

		const product = await Product.findByIdAndDelete(productId);

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
