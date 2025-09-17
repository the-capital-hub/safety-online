import { dbConnect } from "@/lib/dbConnect";
import Product from "@/model/Product";
import Category from "@/model/Categories.js";
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
		const { products } = await request.json();

		if (!Array.isArray(products) || products.length === 0) {
			return NextResponse.json(
				{ success: false, message: "Invalid products data" },
				{ status: 400 }
			);
		}

		const results = {
			success: [],
			failed: [],
		};

		const toNumber = (val) => {
			const num = Number.parseFloat(val);
			return Number.isNaN(num) ? 0 : num;
		};

		const toGoogleUrl = (url = "") => {
			const idMatch = url.match(/\/d\/(.*?)(\/|$)/) || url.match(/id=([^&]+)/);
			return idMatch
				? `https://lh3.googleusercontent.com/d/${idMatch[1]}`
				: url;
		};

		const slugify = (str = "") => str.toLowerCase().trim().replace(/\s+/g, "-");

		const slugToName = (slug = "") =>
			slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

		const categoryCache = new Map();

		for (const productData of products) {
			try {
				// Validate sellerId is present
				if (!productData.sellerId) {
					results.failed.push({
						data: productData,
						error: "Missing sellerId",
					});
					continue;
				}

				const imageUrls = (productData.images || []).map(toGoogleUrl);

				const rawCategory = productData.category || "misc";
				const categorySlug = slugify(rawCategory);

				let categoryDoc = categoryCache.get(categorySlug);
				if (!categoryDoc) {
					const categoryName = slugToName(categorySlug);
					categoryDoc = await Category.findOne({
						name: new RegExp(`^${categoryName}$`, "i"),
					});
					if (!categoryDoc) {
						categoryDoc = await Category.create({
							name: categoryName,
							subCategories: [],
							published: true,
							productCount: 0,
						});
					}
					categoryCache.set(categorySlug, categoryDoc);
				}

				// Map incoming data with safe defaults so that rows with
				// missing fields still create products instead of failing
				const product = new Product({
					sellerId: productData.sellerId, // Use the sellerId from product data
					title: productData.title || "Untitled Product",
					description: productData.description || "No description provided",
					longDescription:
						productData.longDescription ||
						productData.description ||
						"No description provided",
					images: imageUrls,
					category: categorySlug,
					published:
						productData.published !== undefined ? productData.published : true,
					stocks: toNumber(productData.stocks),
					price: toNumber(productData.price),
					salePrice: toNumber(productData.salePrice),
					discount: toNumber(productData.discount),
					type: productData.type || "featured",
					features: productData.features || [],
					keywords: productData.keywords || [],
					subCategory: productData.subCategory || "",
					mainImage: toGoogleUrl(productData.mainImage) || imageUrls[0] || "",
					hsnCode: productData.hsnCode || "",
					brand: productData.brand || "",
					length: toNumber(productData.length),
					width: toNumber(productData.width),
					height: toNumber(productData.height),
					weight: toNumber(productData.weight),
					colour: productData.colour || "",
					material: productData.material || "",
					size: productData.size || "",
				});

				await product.save();
				await Category.findByIdAndUpdate(categoryDoc._id, {
					$inc: { productCount: 1 },
				});
				results.success.push(product);
			} catch (error) {
				results.failed.push({
					data: productData,
					error: error.message,
				});
			}
		}

		return NextResponse.json({
			success: true,
			message: `Bulk upload completed. ${results.success.length} products added, ${results.failed.length} failed.`,
			results,
		});
	} catch (error) {
		console.error("Bulk upload error:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to bulk upload products" },
			{ status: 500 }
		);
	}
}
