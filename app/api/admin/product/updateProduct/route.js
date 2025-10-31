import { dbConnect } from "@/lib/dbConnect";
import Product from "@/model/Product";
import cloudinary from "@/lib/cloudinary.js";
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
		const sellerId = formData.get("sellerId"); // Get sellerId from form

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
                let imageOrder = [];
                const imageOrderRaw = formData.get("imageOrder");

                if (imageOrderRaw) {
                        try {
                                imageOrder = JSON.parse(imageOrderRaw);
                        } catch (error) {
                                console.error("Error parsing image order:", error);
                                imageOrder = [];
                        }
                }

                // Get existing images that should be kept
                const existingImages = formData.getAll("existingImages");

                // Get new image files to upload
                const newImageFiles = formData.getAll("images");
                let newImageUrls = [];

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

                                newImageUrls = await Promise.all(uploadPromises);

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
                let imageUrls = [];

                if (imageOrder.length > 0) {
                        imageOrder.forEach((item) => {
                                if (item?.type === "existing") {
                                        const existingImage = existingImages[item.index] || null;
                                        if (existingImage) {
                                                imageUrls.push(existingImage);
                                        }
                                } else if (item?.type === "new") {
                                        const newImage = newImageUrls[item.index] || null;
                                        if (newImage) {
                                                imageUrls.push(newImage);
                                        }
                                }
                        });

                        // Fallback to default order if reconstruction failed
                        if (!imageUrls.length) {
                                imageUrls = [...existingImages, ...newImageUrls];
                        }
                } else {
                        imageUrls = [...existingImages, ...newImageUrls];
                }

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

		// Update sellerId if provided
		if (sellerId) {
			product.sellerId = sellerId;
		}

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
