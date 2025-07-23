import { dbConnect } from "@/lib/dbConnect.js";
import Product from "@/model/Product.js";

export async function POST(request) {
	await dbConnect();

	try {
		const productData = await request.json();

		// Validate required fields
		const { title, description, price, stocks, category } = productData;

		if (!title || !description || !price || !stocks || !category) {
			return Response.json(
				{ success: false, message: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Create new product
		const product = new Product({
			title,
			description,
			longDescription: productData.longDescription || description,
			images: productData.images || [],
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

		return Response.json({
			success: true,
			message: "Product added successfully",
			product,
		});
	} catch (error) {
		console.error("Add product error:", error);
		return Response.json(
			{ success: false, message: "Failed to add product" },
			{ status: 500 }
		);
	}
}
