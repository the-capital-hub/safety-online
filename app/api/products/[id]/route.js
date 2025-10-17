// /api/products/[id]

import Product from "@/model/Product.js";
import { dbConnect } from "@/lib/dbConnect.js";
import companyDetails from "@/model/companyDetails";
import Review from "@/model/Review";
import { ensureSlug } from "@/lib/slugify.js";

const escapeRegex = (value = "") =>
	value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const createNameVariants = (value = "") => {
	if (!value) {
		return [];
	}

	const trimmed = value.toString().trim();

	if (!trimmed) {
		return [];
	}

	const hyphenated = trimmed.replace(/\s+/g, "-");
	const spaced = trimmed.replace(/-/g, " ");
	const withoutSpacesOrHyphens = trimmed.replace(/[\s-]+/g, "");

	const ampersandReplaced = trimmed.replace(/&/g, "and");
	const ampHyphenated = ampersandReplaced.replace(/\s+/g, "-");
	const ampSpaced = ampersandReplaced.replace(/-/g, " ");
	const ampWithoutSpacesOrHyphens = ampersandReplaced.replace(/[\s-]+/g, "");

	return Array.from(
		new Set([
			trimmed,
			hyphenated,
			spaced,
			withoutSpacesOrHyphens,
			ampersandReplaced,
			ampHyphenated,
			ampSpaced,
			ampWithoutSpacesOrHyphens,
		])
	);
};

const buildRegexArray = (values = []) => {
	const uniqueValues = Array.from(
		new Set(
			values
				.map((value) => value?.toString().trim())
				.filter((value) => value && value.length > 0)
		)
	);

	return uniqueValues.map(
		(value) => new RegExp(`^${escapeRegex(value)}$`, "i")
	);
};

export async function GET(req, { params }) {
	await dbConnect();

	const { id } = await params;

	console.log("Product ID:", id);

	try {
		// Find product with reviews and user info
		const product = await Product.findById(id).populate({
			path: "reviews",
			model: "Review",
			populate: {
				path: "user",
				model: "User",
				select: "firstName lastName profilePic",
			},
		});

		if (!product) {
			return Response.json({ message: "Product not found" }, { status: 404 });
		}

		// Calculate average rating
		const total = product.reviews.reduce(
			(acc, review) => acc + review.rating,
			0
		);
		const averageRating =
			product.reviews.length > 0
				? Number((total / product.reviews.length).toFixed(1))
				: 0;

		console.log("Average rating:", averageRating);

                const sellerCompanyDoc = await companyDetails
                        .findOne(
                                { user: product.sellerId },
                                "companyName companyAddress companyEmail phone brandName brandDescription companyLogo gstinNumber user"
                        )
                        .lean();

                const sellerCompany = sellerCompanyDoc
                        ? {
                                id: sellerCompanyDoc._id.toString(),
                                userId: sellerCompanyDoc.user?.toString?.() || null,
                                companyName: sellerCompanyDoc.companyName,
                                companyAddress: sellerCompanyDoc.companyAddress || [],
                                companyEmail: sellerCompanyDoc.companyEmail || "",
                                phone: sellerCompanyDoc.phone || "",
                                brandName: sellerCompanyDoc.brandName || "",
                                brandDescription: sellerCompanyDoc.brandDescription || "",
                                companyLogo: sellerCompanyDoc.companyLogo || "",
                                gstinNumber: sellerCompanyDoc.gstinNumber || "",
                        }
                        : null;
		// Get related products prioritising the same subcategory when available
		const relatedProductBaseQuery = {
			published: true,
			_id: { $ne: product._id },
		};

		let relatedProducts = [];

		if (product.category) {
			const categoryRegexes = buildRegexArray([
				product.category,
				...createNameVariants(product.category),
			]);

			if (categoryRegexes.length > 0) {
				relatedProductBaseQuery.category = { $in: categoryRegexes };
			} else {
				relatedProductBaseQuery.category = product.category;
			}
		}

		if (product.subCategory) {
			const normalizedSubCategory = ensureSlug(product.subCategory);
			const subCategoryRegexes = buildRegexArray([
				product.subCategory,
				normalizedSubCategory,
				...createNameVariants(product.subCategory),
				...createNameVariants(normalizedSubCategory),
			]);

			if (subCategoryRegexes.length > 0) {
				relatedProducts = await Product.find({
					...relatedProductBaseQuery,
					subCategory: { $in: subCategoryRegexes },
				})
					.limit(4)
					.lean();
			}
		}

		if (relatedProducts.length === 0) {
			relatedProducts = await Product.find(relatedProductBaseQuery)
				.limit(4)
				.lean();
		}

		const productSpecifications = {
			brand: product.brand,
			length: product.length,
			width: product.width,
			height: product.height,
			weight: product.weight,
			color: product.colour,
			material: product.material,
			hsnCode: product.hsnCode,
			size: product.size,
		};

		// Transform product data
                const transformedProduct = {
                        id: product._id.toString(),
                        sellerId:
                                typeof product.sellerId === "object"
                                        ? product.sellerId?.toString?.()
                                        : product.sellerId?.toString?.() || "",
                        name: product.title,
			description: product.description,
			longDescription: product.longDescription || product.description,
			price: product.salePrice > 0 ? product.salePrice : product.price,
			originalPrice: product.price,
			discountPercentage: product.discount.toFixed(0) || 0,
			category: product.category,
			subCategory: product.subCategory,
			images: product.images || [],
			image:
				product.images?.[0] ||
				"https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png",
			inStock: product.stocks > 0,
			stocks: product.stocks,
			status: product.stocks > 0 ? "In Stock" : "Out of Stock",
			type: product.type,
			published: product.published,
			features: product.features || [],
			rating: averageRating || 0,
			reviews: product.reviews || [],
			keywords: product.keywords || [],
			specifications: productSpecifications || {},
			createdAt: product.createdAt,
			updatedAt: product.updatedAt,
		};

		// Transform related products
		const transformedRelatedProducts = relatedProducts.map((p) => ({
			id: p._id.toString(),
			name: p.title,
			description: p.description,
			price: p.salePrice > 0 ? p.salePrice : p.price,
			originalPrice: p.price,
			discountPercentage: p.discount.toFixed(0) || 0,
			image:
				p.images?.[0] ||
				"https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png",
			inStock: p.stocks > 0,
			status: p.stocks > 0 ? "In Stock" : "Out of Stock",
			category: p.category,
			type: p.type,
		}));

		return Response.json({
			success: true,
			product: transformedProduct,
			relatedProducts: transformedRelatedProducts,
			companyDetails: sellerCompany,
		});
	} catch (error) {
		console.error("Product fetch error:", error);
		return Response.json(
			{ success: false, message: "Failed to fetch product" },
			{ status: 500 }
		);
	}
}
