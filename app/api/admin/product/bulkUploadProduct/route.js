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

                const toNumber = (val) => {
                        const num = Number.parseFloat(val);
                        return Number.isNaN(num) ? 0 : num;
                };

                const toGoogleUrl = (url = "") => {
                        const idMatch =
                                url.match(/\/d\/(.*?)(\/|$)/) || url.match(/id=([^&]+)/);
                        return idMatch ? `https://lh3.googleusercontent.com/d/${idMatch[1]}` : url;
                };

                for (const productData of products) {
                        try {
                                const imageUrls = (productData.images || []).map(toGoogleUrl);

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
                                        stocks: toNumber(productData.stocks),
                                        price: toNumber(productData.price),
                                        salePrice: toNumber(productData.salePrice),
                                        discount: toNumber(productData.discount),
                                        type: productData.type || "featured",
                                        features: productData.features || [],
                                        keywords: productData.keywords || [],
                                        subCategory: productData.subCategory || "",
                                        mainImage:
                                                toGoogleUrl(productData.mainImage) ||
                                                imageUrls[0] ||
                                                "",
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
