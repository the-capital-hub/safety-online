import { dbConnect } from "@/lib/dbConnect";
import Product from "@/model/Product";

export async function PUT(request) {
	await dbConnect();

	try {
		const { productId, ...updateData } = await request.json();

		if (!productId) {
			return Response.json(
				{ success: false, message: "Product ID is required" },
				{ status: 400 }
			);
		}

		// Find and update product
		const product = await Product.findById(productId);

		if (!product) {
			return Response.json(
				{ success: false, message: "Product not found" },
				{ status: 404 }
			);
		}

		// Update fields
		Object.keys(updateData).forEach((key) => {
			if (updateData[key] !== undefined) {
				if (key === "price" || key === "salePrice" || key === "discount") {
					product[key] = Number.parseFloat(updateData[key]);
				} else if (key === "stocks") {
					product[key] = Number.parseInt(updateData[key]);
				} else {
					product[key] = updateData[key];
				}
			}
		});

		await product.save();

		return Response.json({
			success: true,
			message: "Product updated successfully",
			product,
		});
	} catch (error) {
		console.error("Update product error:", error);
		return Response.json(
			{ success: false, message: "Failed to update product" },
			{ status: 500 }
		);
	}
}
