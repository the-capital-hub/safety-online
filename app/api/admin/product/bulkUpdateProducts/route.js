import { dbConnect } from "@/lib/dbConnect";
import Product from "@/model/Product";
import { uploadMultipleImagesToCloudinary } from "@/lib/cloudnary.js";

export async function PUT(request) {
	await dbConnect();

	try {
		const { productIds, updateData } = await request.json();

		if (!Array.isArray(productIds) || productIds.length === 0) {
			return Response.json(
				{ success: false, message: "Product IDs are required" },
				{ status: 400 }
			);
		}

		const processedUpdateData = { ...updateData };

		// Handle image uploads if provided
		if (updateData.images && updateData.images.length > 0) {
			try {
				// Extract base64 data from images
				const base64Images = updateData.images
					.map((img) => img.base64)
					.filter(Boolean);

				if (base64Images.length > 0) {
					const imageUrls = await uploadMultipleImagesToCloudinary(
						base64Images,
						"products"
					);
					processedUpdateData.images = imageUrls;
				}
			} catch (error) {
				console.error("Image upload error:", error);
				return Response.json(
					{
						success: false,
						message: "Failed to upload images",
					},
					{ status: 500 }
				);
			}
		}

		// Update multiple products
		const result = await Product.updateMany(
			{ _id: { $in: productIds } },
			{ $set: processedUpdateData }
		);

		return Response.json({
			success: true,
			message: `Successfully updated ${result.modifiedCount} products`,
			modifiedCount: result.modifiedCount,
		});
	} catch (error) {
		console.error("Bulk update products error:", error);
		return Response.json(
			{ success: false, message: "Failed to bulk update products" },
			{ status: 500 }
		);
	}
}
