import { dbConnect } from "@/lib/dbConnect";
import Product from "@/model/Product";
import cloudinary from "@/lib/cloudinary.js";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const maxRequestBodySize = "20mb";

export async function PUT(request) {
        await dbConnect();

	// Get token from cookies
	const token = request.cookies.get("seller-auth-token")?.value;

	if (!token) {
		return NextResponse.json(
			{ success: false, message: "Unauthorized" },
			{ status: 401 }
		);
	}

	// Verify token
	const decoded = jwt.verify(token, process.env.JWT_SECRET);
	const userId = decoded.userId;

	try {
		const formData = await request.formData();

		// Get productId from formData
		const productId = formData.get("productId");

		if (!productId) {
			return NextResponse.json(
				{ success: false, message: "Product ID is required" },
				{ status: 400 }
			);
		}

		// Find product
		const product = await Product.findOne({
			_id: productId,
			sellerId: userId,
		});

		if (!product || product.sellerId.toString() !== userId) {
			return NextResponse.json(
				{ success: false, message: "Product not found" },
				{ status: 404 }
			);
		}

		// Extract product data from formData
		const title = formData.get("title");
		const description = formData.get("description");
		const longDescription = formData.get("longDescription");
		const category = formData.get("category");
		const price = Number.parseFloat(formData.get("price"));
		const salePrice = formData.get("salePrice")
			? Number.parseFloat(formData.get("salePrice"))
			: 0;
		const stocks = Number.parseInt(formData.get("stocks"));
		const discount = formData.get("discount")
			? Number.parseFloat(formData.get("discount"))
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

        // Parse product IDs
        let productIds = [];
        try {
                const rawProductIds = formData.get("productIds");
                if (rawProductIds) {
                        const parsed = JSON.parse(rawProductIds);
                        if (Array.isArray(parsed)) {
                                productIds = parsed
                                        .map((id) => (typeof id === "string" ? id.trim() : String(id || "")))
                                        .filter((id, index, arr) => id.length > 0 && arr.indexOf(id) === index);
                        }
                }
        } catch (error) {
                console.error("Error parsing product IDs:", error);
                productIds = [];
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
				return NextResponse.json(
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
        product.productIds = productIds;
		product.images = imageUrls;
		product.mainImage = imageUrls.length > 0 ? imageUrls[0] : "";
		product.subCategory = formData.get("subCategory") || "";
		product.hsnCode = formData.get("hsnCode") || "";
		product.brand = formData.get("brand") || "";
		product.length = formData.get("length")
			? Number.parseFloat(formData.get("length"))
			: null;
		product.width = formData.get("width")
			? Number.parseFloat(formData.get("width"))
			: null;
		product.height = formData.get("height")
			? Number.parseFloat(formData.get("height"))
			: null;
		product.weight = formData.get("weight")
			? Number.parseFloat(formData.get("weight"))
			: null;
		product.colour = formData.get("colour") || "";
		product.material = formData.get("material") || "";
		product.size = formData.get("size") || "";

		await product.save();

		console.log("Product updated successfully:", product._id);

		return NextResponse.json({
			success: true,
			message: "Product updated successfully",
			product,
		});
	} catch (error) {
		console.error("Update product error:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to update product" },
			{ status: 500 }
		);
	}
}
