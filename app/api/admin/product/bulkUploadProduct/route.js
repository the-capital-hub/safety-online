import { dbConnect } from "@/lib/dbConnect";
import Product from "@/model/Product";
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
	const userId = decoded.userId;

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

                for (const productData of products) {
                        try {
                                const imageUrls = productData.images || [];

                                // Map incoming data with safe defaults so that rows with
                                // missing fields still create products instead of failing
                                const product = new Product({
                                        sellerId: userId,
                                        title: productData.title || "Untitled Product",
                                        description:
                                                productData.description ||
                                                "No description provided",
                                        longDescription:
                                                productData.longDescription ||
                                                productData.description ||
                                                "No description provided",
                                        images: imageUrls,
                                        category: productData.category || "misc",
                                        published:
                                                productData.published !== undefined
                                                        ? productData.published
                                                        : true,
                                        stocks:
                                                productData.stocks !== undefined
                                                        ? Number.parseInt(productData.stocks)
                                                        : 0,
                                        price:
                                                productData.price !== undefined
                                                        ? Number.parseFloat(productData.price)
                                                        : 0,
                                        salePrice: productData.salePrice
                                                ? Number.parseFloat(productData.salePrice)
                                                : 0,
                                        discount: productData.discount
                                                ? Number.parseFloat(productData.discount)
                                                : 0,
                                        type: productData.type || "featured",
                                        features: productData.features || [],
                                        subCategory: productData.subCategory || "",
                                        mainImage: productData.mainImage || imageUrls[0] || "",
                                        hsnCode: productData.hsnCode || "",
                                        brand: productData.brand || "",
                                        length: productData.length
                                                ? Number.parseFloat(productData.length)
                                                : null,
                                        width: productData.width
                                                ? Number.parseFloat(productData.width)
                                                : null,
                                        height: productData.height
                                                ? Number.parseFloat(productData.height)
                                                : null,
                                        weight: productData.weight
                                                ? Number.parseFloat(productData.weight)
                                                : null,
                                        colour: productData.colour || "",
                                        material: productData.material || "",
                                        size: productData.size || "",
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
