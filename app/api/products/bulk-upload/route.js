import { dbConnect } from "@/lib/dbConnect.js";
import Product from "@/model/Product.js";
import Category from "@/model/Categories.js";

// Transform function to convert your data format to Product schema
function transformProductData(productData) {
        return {
                title: productData.name,
                description: productData.description,
                longDescription: productData.longDescription,
                images: productData.gallery || [productData.image],
                category: productData.category,
                published: true,
                stocks: 50, // Default stock value, you can modify this
                price: productData.price,
                salePrice: 0, // Set if there's a sale price
                discount: 0, // Set if there's a discount
		inStock: productData.inStock !== undefined ? productData.inStock : true,
		features: productData.features || [],
		// The schema will auto-generate status and type based on other fields
	};
}

export async function POST(req) {
        await dbConnect();

        try {
                const { products, clearExisting = false } = await req.json();

		// Validate input
		if (!products || !Array.isArray(products)) {
			return Response.json(
				{ message: "Products array is required" },
				{ status: 400 }
			);
		}

		// Clear existing products if requested
		if (clearExisting) {
			await Product.deleteMany({});
			console.log("Cleared existing products");
		}

                // Transform and validate products
                const transformedProducts = [];
                const errors = [];
                const slugify = (str = "") =>
                        str.toLowerCase().trim().replace(/\s+/g, "-");
                const slugToName = (slug = "") =>
                        slug
                                .replace(/-/g, " ")
                                .replace(/\b\w/g, (char) => char.toUpperCase());
                const categoryCache = new Map();
                const categoryIncrements = new Map();

		for (let i = 0; i < products.length; i++) {
			try {
				const product = products[i];

				// Basic validation
				if (!product.name || !product.description || !product.price) {
					errors.push(
						`Product at index ${i}: Missing required fields (name, description, price)`
					);
					continue;
				}

                                const transformedProduct = transformProductData(product);
                                const categorySlug = slugify(
                                        transformedProduct.category || "misc"
                                );
                                transformedProduct.category = categorySlug;

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
                                const key = categoryDoc._id.toString();
                                categoryIncrements.set(
                                        key,
                                        (categoryIncrements.get(key) || 0) + 1
                                );

                                transformedProducts.push(transformedProduct);
                        } catch (error) {
                                errors.push(`Product at index ${i}: ${error.message}`);
                        }
                }

		if (errors.length > 0 && transformedProducts.length === 0) {
			return Response.json(
				{
					message: "All products failed validation",
					errors,
					processed: 0,
					failed: errors.length,
				},
				{ status: 400 }
			);
		}

                // Insert products in batches to avoid memory issues
                const batchSize = 10;
                const insertedProducts = [];
                const insertErrors = [];

		for (let i = 0; i < transformedProducts.length; i += batchSize) {
			const batch = transformedProducts.slice(i, i + batchSize);

			try {
				const result = await Product.insertMany(batch, {
					ordered: false, // Continue inserting even if some fail
					rawResult: true,
				});
				insertedProducts.push(...result.insertedIds);
			} catch (error) {
				// Handle duplicate key errors and other insertion errors
				if (error.writeErrors) {
					error.writeErrors.forEach((writeError) => {
						insertErrors.push(
							`Batch ${Math.floor(i / batchSize) + 1}: ${writeError.errmsg}`
						);
					});
				} else {
					insertErrors.push(
						`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`
					);
				}
			}
		}

                // Update product counts for categories
                for (const [id, count] of categoryIncrements) {
                        await Category.findByIdAndUpdate(id, {
                                $inc: { productCount: count },
                        });
                }

                // Get final count of inserted products
                const insertedCount = insertedProducts.length;

                return Response.json({
                        message: "Bulk upload completed",
                        summary: {
                                totalProvided: products.length,
                                validationErrors: errors.length,
                                processed: transformedProducts.length,
                                inserted: insertedCount,
                                insertionErrors: insertErrors.length,
                        },
                        validationErrors: errors.length > 0 ? errors : undefined,
                        insertionErrors: insertErrors.length > 0 ? insertErrors : undefined,
                });
        } catch (error) {
                console.error("Bulk upload error:", error);
                return Response.json(
                        {
				message: "Failed to process bulk upload",
				error: error.message,
			},
			{ status: 500 }
		);
	}
}

// GET method to check upload status or get sample format
export async function GET() {
	return Response.json({
		message: "Bulk upload endpoint",
		method: "POST",
		endpoint: "/api/products/bulk-upload",
		expectedFormat: {
			products: [
				{
					name: "Product Name (required)",
					description: "Short description (required)",
					longDescription: "Detailed description",
					price: 1000, // required, number
					image: "main_image_url",
					gallery: ["image1_url", "image2_url"], // optional array
					category: "product-category", // required
					inStock: true, // optional, defaults to true
					featured: false, // optional
					features: [
						// optional array
						{
							title: "Feature Title",
							description: "Feature Description",
						},
					],
					relatedProducts: ["product_id_1", "product_id_2"], // optional, will be ignored in bulk upload
				},
			],
			clearExisting: false, // optional, set to true to clear all existing products first
		},
		notes: [
			"The 'stocks' field will default to 50 for all products",
			"The 'published' field will default to true",
			"The 'status' and 'type' fields will be auto-generated based on stock and pricing",
			"Related products should be set up after initial upload using product IDs",
			"Images should be accessible URLs or uploaded to your storage first",
		],
	});
}
