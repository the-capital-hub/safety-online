import { dbConnect } from "@/lib/dbConnect";
import Product from "@/model/Product";
import cloudinary from "@/lib/cloudnary.js";

export async function PUT(request) {
	await dbConnect();

	try {
		const formData = await request.formData();

		// Get productId from formData
		const productId = formData.get("productId");

		if (!productId) {
			return Response.json(
				{ success: false, message: "Product ID is required" },
				{ status: 400 }
			);
		}

		// Find product
		const product = await Product.findById(productId);

		if (!product) {
			return Response.json(
				{ success: false, message: "Product not found" },
				{ status: 404 }
			);
		}

		// Extract product data from formData
		const title = formData.get("title");
		const description = formData.get("description");
		const longDescription = formData.get("longDescription");
		const category = formData.get("category");
		const price = parseFloat(formData.get("price"));
		const salePrice = formData.get("salePrice")
			? parseFloat(formData.get("salePrice"))
			: 0;
		const stocks = parseInt(formData.get("stocks"));
		const discount = formData.get("discount")
			? parseFloat(formData.get("discount"))
			: 0;
		const type = formData.get("type");
		const published = formData.get("published") === "true";

		// Parse features
		let features = [];
		try {
			const featuresString = formData.get("features");
			if (featuresString) {
				features = JSON.parse(featuresString);
			}
		} catch (error) {
			console.error("Error parsing features:", error);
			features = [];
		}

		// Handle images
		let imageUrls = [];

		// Get existing images that should be kept
		const existingImages = formData.getAll("existingImages");
		imageUrls = [...existingImages];

		// Get new image files to upload
		const newImageFiles = formData.getAll("images");

		if (newImageFiles.length > 0) {
			try {
				// Upload new images to Cloudinary
				const uploadPromises = newImageFiles.map(async (file) => {
					try {
						// Check if file is a Blob/File object
						if (!(file instanceof Blob)) {
							throw new Error("Invalid file format");
						}

						const buffer = Buffer.from(await file.arrayBuffer());

						return new Promise((resolve, reject) => {
							cloudinary.uploader
								.upload_stream(
									{
										resource_type: "image",
										folder: "safety_products_images",
										quality: "auto",
										format: "webp",
									},
									(error, result) => {
										if (error) {
											console.error("Cloudinary upload error:", error);
											reject(error);
										} else {
											resolve(result.secure_url);
										}
									}
								)
								.end(buffer);
						});
					} catch (error) {
						console.error("File processing error:", error);
						throw error;
					}
				});

				const newImageUrls = await Promise.all(uploadPromises);
				imageUrls = [...imageUrls, ...newImageUrls];

				console.log("New images uploaded successfully:", newImageUrls.length);
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

		// Update product fields
		product.title = title;
		product.description = description;
		product.longDescription = longDescription || description;
		product.category = category;
		product.price = price;
		product.salePrice = salePrice;
		product.stocks = stocks;
		product.discount = discount;
		product.type = type;
		product.published = published;
		product.features = features;
		product.images = imageUrls;

		await product.save();

		console.log("Product updated successfully:", product._id);

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
