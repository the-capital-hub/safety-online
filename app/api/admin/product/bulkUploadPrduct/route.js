// // api/admin/product/bulkUploadPrduct/route.js

// import { dbConnect } from "@/lib/dbConnect.js";
// import Product from "@/model/Product.js";

// export async function POST(request) {
// 	await dbConnect();

// 	try {
// 		const { products } = await request.json();

// 		if (!Array.isArray(products) || products.length === 0) {
// 			return Response.json(
// 				{ success: false, message: "Invalid products data" },
// 				{ status: 400 }
// 			);
// 		}

// 		const results = {
// 			success: [],
// 			failed: [],
// 		};

// 		for (const productData of products) {
// 			try {
// 				// Validate required fields
// 				const { title, description, price, stocks, category } = productData;

// 				if (!title || !description || !price || !stocks || !category) {
// 					results.failed.push({
// 						data: productData,
// 						error: "Missing required fields",
// 					});
// 					continue;
// 				}

// 				// Create new product
// 				const product = new Product({
// 					title,
// 					description,
// 					longDescription: productData.longDescription || description,
// 					images: productData.images || [],
// 					category,
// 					published:
// 						productData.published !== undefined ? productData.published : true,
// 					stocks: Number.parseInt(stocks),
// 					price: Number.parseFloat(price),
// 					salePrice: productData.salePrice
// 						? Number.parseFloat(productData.salePrice)
// 						: 0,
// 					discount: productData.discount
// 						? Number.parseFloat(productData.discount)
// 						: 0,
// 					type: productData.type || "featured",
// 					features: productData.features || [],
// 				});

// 				await product.save();
// 				results.success.push(product);
// 			} catch (error) {
// 				results.failed.push({
// 					data: productData,
// 					error: error.message,
// 				});
// 			}
// 		}

// 		return Response.json({
// 			success: true,
// 			message: `Bulk upload completed. ${results.success.length} products added, ${results.failed.length} failed.`,
// 			results,
// 		});
// 	} catch (error) {
// 		console.error("Bulk upload error:", error);
// 		return Response.json(
// 			{ success: false, message: "Failed to bulk upload products" },
// 			{ status: 500 }
// 		);
// 	}
// }

import { dbConnect } from "@/lib/dbConnect";
import Product from "@/model/Product";
import { uploadMultipleImagesToCloudinary } from "@/lib/cloudnary.js";

export async function POST(request) {
	await dbConnect();

	try {
		const { products } = await request.json();

		if (!Array.isArray(products) || products.length === 0) {
			return Response.json(
				{ success: false, message: "Invalid products data" },
				{ status: 400 }
			);
		}

		const results = {
			success: [],
			failed: [],
		};

		for (const productData of products) {
			try {
				// Validate required fields
				const { title, description, price, stocks, category } = productData;

				if (!title || !description || !price || !stocks || !category) {
					results.failed.push({
						data: productData,
						error: "Missing required fields",
					});
					continue;
				}

				let imageUrls = [];

				// Handle image uploads if provided
				if (productData.images && productData.images.length > 0) {
					try {
						// Extract base64 data from images
						const base64Images = productData.images
							.map((img) =>
								typeof img === "string" && img.startsWith("data:")
									? img
									: img.base64
							)
							.filter(Boolean);

						if (base64Images.length > 0) {
							imageUrls = await uploadMultipleImagesToCloudinary(
								base64Images,
								"products"
							);
						}
					} catch (error) {
						console.error("Image upload error for product:", title, error);
						// Continue without images rather than failing the entire product
					}
				}

				// Create new product
				const product = new Product({
					title,
					description,
					longDescription: productData.longDescription || description,
					images: imageUrls,
					category,
					published:
						productData.published !== undefined ? productData.published : true,
					stocks: Number.parseInt(stocks),
					price: Number.parseFloat(price),
					salePrice: productData.salePrice
						? Number.parseFloat(productData.salePrice)
						: 0,
					discount: productData.discount
						? Number.parseFloat(productData.discount)
						: 0,
					type: productData.type || "featured",
					features: productData.features || [],
				});

				await product.save();
				results.success.push(product);
			} catch (error) {
				results.failed.push({
					data: productData,
					error: error.message,
				});
			}
		}

		return Response.json({
			success: true,
			message: `Bulk upload completed. ${results.success.length} products added, ${results.failed.length} failed.`,
			results,
		});
	} catch (error) {
		console.error("Bulk upload error:", error);
		return Response.json(
			{ success: false, message: "Failed to bulk upload products" },
			{ status: 500 }
		);
	}
}
