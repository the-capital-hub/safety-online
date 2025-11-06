import { dbConnect } from "@/lib/dbConnect.js";
import Product from "@/model/Product.js";
import cloudinary from "@/lib/cloudinary.js";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(request) {
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

		// Extract product data from formData
		const title = formData.get("title");
		const description = formData.get("description");
		const price = Number.parseFloat(formData.get("price"));
		const stocks = Number.parseInt(formData.get("stocks"));
		const category = formData.get("category");
		const sellerId = formData.get("sellerId"); // Get sellerId from form
		const imageFiles = formData.getAll("images");

		// Validate required fields
		if (
			!title ||
			!description ||
			!price ||
			!stocks ||
			!category ||
			!sellerId ||
			!imageFiles.length
		) {
			return NextResponse.json(
				{
					success: false,
					message: "Missing required fields",
					received: {
						title: !!title,
						description: !!description,
						price: !!price,
						stocks: !!stocks,
						category: !!category,
						sellerId: !!sellerId,
						images: imageFiles.length,
					},
				},
				{ status: 400 }
			);
		}

		// Upload images to Cloudinary
		const uploadPromises = imageFiles.map(async (file) => {
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

		const imageUrls = await Promise.all(uploadPromises);

                // Parse features safely
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
                        const productIdsRaw = formData.get("productIds");
                        if (productIdsRaw) {
                                const parsed = JSON.parse(productIdsRaw);
                                if (Array.isArray(parsed)) {
                                        productIds = parsed
                                                .map((id) =>
                                                        typeof id === "string" ? id.trim() : String(id || "")
                                                )
                                                .filter((id, index, arr) => id.length > 0 && arr.indexOf(id) === index);
                                }
                        }
                } catch (error) {
                        console.error("Error parsing product IDs:", error);
                        productIds = [];
                }

		// Create new product
		const product = new Product({
			sellerId: sellerId, // Use the sellerId from form
			title,
			description,
			longDescription: formData.get("longDescription") || description,
			images: imageUrls,
			category,
			published: formData.get("published") === "true",
			stocks: stocks,
			price: price,
			salePrice: formData.get("salePrice")
				? Number.parseFloat(formData.get("salePrice"))
				: 0,
			discount: formData.get("discount")
				? Number.parseFloat(formData.get("discount"))
				: 0,
			type: formData.get("type") || "featured",
                        features: features,
                        productIds,
			subCategory: formData.get("subCategory") || "",
			mainImage: imageUrls.length > 0 ? imageUrls[0] : "",
			hsnCode: formData.get("hsnCode") || "",
			brand: formData.get("brand") || "",
			length: formData.get("length")
				? Number.parseFloat(formData.get("length"))
				: null,
			width: formData.get("width")
				? Number.parseFloat(formData.get("width"))
				: null,
			height: formData.get("height")
				? Number.parseFloat(formData.get("height"))
				: null,
			weight: formData.get("weight")
				? Number.parseFloat(formData.get("weight"))
				: null,
			colour: formData.get("colour") || "",
			material: formData.get("material") || "",
			size: formData.get("size") || "",
		});

		await product.save();

		console.log("Product saved successfully:", product._id);

		return NextResponse.json({
			success: true,
			message: "Product added successfully",
			product,
		});
	} catch (error) {
		console.error("Add product error:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to add product",
				error: error.message || "Unknown error",
			},
			{ status: 500 }
		);
	}
}
