// app/api/products/route.js

import { dbConnect } from "@/lib/dbConnect.js";
import Product from "@/model/Product.js";
import Review from "@/model/Review";
import Categories from "@/model/Categories";
import { ensureSlug } from "@/lib/slugify.js";

export async function GET(request) {
	await dbConnect();

	try {
		const { searchParams } = new URL(request.url);

		// Extract query parameters
		const minPrice = searchParams.get("minPrice");
		const maxPrice = searchParams.get("maxPrice");
		const inStock = searchParams.get("inStock");
		const discount = searchParams.get("discount");
		const category = searchParams.get("category");
		const subCategoryParam = searchParams.get("subCategory");
		const search = searchParams.get("search");
		const type = searchParams.get("type");
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "12");
		const sort = searchParams.get("sort") || "createdAt";
		const order = searchParams.get("order") || "desc";

		// console.log("API Route - Received params:", {
		// 	category,
		// 	minPrice,
		// 	maxPrice,
		// 	inStock,
		// 	discount,
		// 	search,
		// 	type,
		// 	page,
		// 	sort,
		// 	order,
		// });

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

                                                .map((value) =>
                                                        value?.toString().trim()
                                                )

                                                .filter((value) => value && value.length > 0)
                                )
                        );

                        return uniqueValues.map(
                                (value) => new RegExp(`^${escapeRegex(value)}$`, "i")
                        );
                };

                const appendValueAndVariants = (set, rawValue) => {
                        if (rawValue === undefined || rawValue === null) {
                                return;
                        }

                        const stringValue =
                                typeof rawValue === "string"
                                        ? rawValue
                                        : rawValue?.toString?.() || "";

                        const trimmed = stringValue.trim();

                        if (!trimmed) {
                                return;
                        }

                        const maybeAdd = (value) => {
                                if (!value && value !== 0) {
                                        return;
                                }

                                const valueString =
                                        typeof value === "string"
                                                ? value
                                                : value?.toString?.() || "";

                                const valueTrimmed = valueString.trim();

                                if (valueTrimmed) {
                                        set.add(valueTrimmed);
                                }
                        };

                        maybeAdd(trimmed);

                        const normalized = ensureSlug(trimmed);

                        if (normalized && normalized !== trimmed) {
                                set.add(normalized);
                        }

                        createNameVariants(trimmed).forEach((variant) => {
                                const variantTrimmed = variant.trim();

                                if (!variantTrimmed) {
                                        return;
                                }

                                set.add(variantTrimmed);

                                const variantNormalized = ensureSlug(variantTrimmed);

                                if (
                                        variantNormalized &&
                                        variantNormalized !== variantTrimmed &&
                                        variantNormalized !== normalized
                                ) {
                                        set.add(variantNormalized);
                                }
                        });
                };

                const doesIdentifierMatch = (
                        identifier,
                        normalizedIdentifier,
                        candidatesSet
                ) => {
                        if (identifier === undefined || identifier === null) {
                                return false;
                        }

                        const identifierString =
                                typeof identifier === "string"
                                        ? identifier
                                        : identifier?.toString?.() || "";

                        const trimmedIdentifier = identifierString.trim();

                        if (!trimmedIdentifier) {
                                return false;
                        }

                        const lowerIdentifier = trimmedIdentifier.toLowerCase();

                        for (const candidate of candidatesSet) {
                                const candidateString =
                                        typeof candidate === "string"
                                                ? candidate
                                                : candidate?.toString?.();

                                if (!candidateString) {
                                        continue;
                                }

                                const trimmedCandidate = candidateString.trim();

                                if (!trimmedCandidate) {
                                        continue;
                                }

                                if (trimmedCandidate === trimmedIdentifier) {
                                        return true;
                                }

                                if (trimmedCandidate.toLowerCase() === lowerIdentifier) {
                                        return true;
                                }

                                if (
                                        normalizedIdentifier &&
                                        ensureSlug(trimmedCandidate) === normalizedIdentifier
                                ) {
                                        return true;
                                }
                        }

                        return false;
                };

                let categoriesCache = null;

                const getPublishedCategories = async () => {
                        if (!categoriesCache) {
                                categoriesCache = await Categories.find(
                                        { published: true },
                                        { name: 1, subCategories: 1 }
                                ).lean();
                        }

                        return categoriesCache;
                };


		const ensureAndConditions = (queryObject) => {
			if (!queryObject.$and) {
				queryObject.$and = [];
			}

			return queryObject.$and;
		};

		// Build query
		const query = { published: true };

                let matchedCategoryValuesFromSubCategory = new Set();

                if (subCategoryParam) {
                        const normalizedSubCategory = ensureSlug(subCategoryParam);
                        const possibleSubCategoryValues = new Set();

                        appendValueAndVariants(possibleSubCategoryValues, subCategoryParam);

                        if (
                                normalizedSubCategory &&
                                normalizedSubCategory !== subCategoryParam
                        ) {
                                appendValueAndVariants(
                                        possibleSubCategoryValues,
                                        normalizedSubCategory
                                );
                        }

                        const categoriesWithSubCategories =
                                await getPublishedCategories();

                        categoriesWithSubCategories.forEach((categoryDocument) => {
                                categoryDocument.subCategories?.forEach((subCategory) => {
                                        const candidateValues = new Set();

                                        appendValueAndVariants(
                                                candidateValues,
                                                subCategory?.name
                                        );

                                        if (subCategory?.slug) {
                                                appendValueAndVariants(
                                                        candidateValues,
                                                        subCategory.slug
                                                );
                                        }

                                        if (subCategory?._id) {
                                                appendValueAndVariants(
                                                        candidateValues,
                                                        subCategory._id.toString()
                                                );
                                        }

                                        if (
                                                doesIdentifierMatch(
                                                        subCategoryParam,
                                                        normalizedSubCategory,
                                                        candidateValues
                                                )
                                        ) {
                                                candidateValues.forEach((value) => {
                                                        possibleSubCategoryValues.add(value);
                                                });

                                                appendValueAndVariants(
                                                        matchedCategoryValuesFromSubCategory,
                                                        categoryDocument.name
                                                );

                                                if (categoryDocument.slug) {
                                                        appendValueAndVariants(
                                                                matchedCategoryValuesFromSubCategory,
                                                                categoryDocument.slug
                                                        );
                                                }
                                        }
                                });
                        });

                        const subCategoryRegexes = buildRegexArray(
                                Array.from(possibleSubCategoryValues)
                        );

                        const subCategoryConditions = [];

                        if (subCategoryRegexes.length > 0) {
                                subCategoryConditions.push({
                                        subCategory: { $in: subCategoryRegexes },
                                });
                        }

                        if (subCategoryConditions.length > 0) {
                                ensureAndConditions(query).push({ $or: subCategoryConditions });
                        } else {
                                query.subCategory = subCategoryParam;
                        }


                        if (matchedCategoryValuesFromSubCategory.size > 0) {
                                const categoryRegexesFromSubCategory = buildRegexArray(
                                        Array.from(matchedCategoryValuesFromSubCategory)
                                );

                                if (categoryRegexesFromSubCategory.length > 0) {
                                        ensureAndConditions(query).push({
                                                category: { $in: categoryRegexesFromSubCategory },
                                        });
                                }
                        }
                }

                if (category && category !== "all") {
                        const categoryVariantsToCheck = Array.from(
                                new Set([category, ...createNameVariants(category)])
                        );

                        const normalizedCategory = ensureSlug(category);
                        const categoriesWithSubCategories = await getPublishedCategories();

                        let categoryDocument = null;
                        let matchedCategoryCandidateValues = new Set();

                        for (const categoryEntry of categoriesWithSubCategories) {
                                const candidateValues = new Set();

                                appendValueAndVariants(
                                        candidateValues,
                                        categoryEntry?.name
                                );

                                if (categoryEntry?.slug) {
                                        appendValueAndVariants(
                                                candidateValues,
                                                categoryEntry.slug
                                        );
                                }

                                if (categoryEntry?._id) {
                                        candidateValues.add(categoryEntry._id.toString());
                                }

                                const directMatch = doesIdentifierMatch(
                                        category,
                                        normalizedCategory,
                                        candidateValues
                                );

                                const variantMatch = categoryVariantsToCheck.some((variant) =>
                                        doesIdentifierMatch(
                                                variant,
                                                ensureSlug(variant),
                                                candidateValues
                                        )
                                );

                                if (directMatch || variantMatch) {
                                        categoryDocument = categoryEntry;
                                        matchedCategoryCandidateValues = candidateValues;
                                        break;
                                }
                        }

                        if (categoryDocument) {
                                const orConditions = [];
                                const combinedCategoryValues = new Set([
                                        ...matchedCategoryCandidateValues,
                                        ...categoryVariantsToCheck,
                                ]);

                                const categoryRegexes = buildRegexArray(
                                        Array.from(combinedCategoryValues)
                                );

                                if (categoryRegexes.length > 0) {
                                        orConditions.push({ category: { $in: categoryRegexes } });
                                }

                                const subCategoryCandidates = new Set();

                                categoryDocument.subCategories?.forEach((subCategory) => {
                                        appendValueAndVariants(
                                                subCategoryCandidates,
                                                subCategory?.name
                                        );

                                        if (subCategory?.slug) {
                                                appendValueAndVariants(
                                                        subCategoryCandidates,
                                                        subCategory.slug
                                                );
                                        }

                                        if (subCategory?._id) {
                                                appendValueAndVariants(
                                                        subCategoryCandidates,
                                                        subCategory._id.toString()
                                                );
                                        }
                                });

                                const subCategoryRegexes = buildRegexArray(
                                        Array.from(subCategoryCandidates)
                                );

                                if (subCategoryRegexes.length > 0) {
                                        orConditions.push({
                                                subCategory: { $in: subCategoryRegexes },
                                        });
                                }

                                if (orConditions.length > 0) {
                                        ensureAndConditions(query).push({ $or: orConditions });
                                } else if (categoryDocument.name) {
                                        query.category = categoryDocument.name;
                                } else {
                                        query.category = category;
                                }
                        } else {
                                const fallbackCategoryValues = new Set();

                                categoryVariantsToCheck.forEach((value) =>
                                        appendValueAndVariants(fallbackCategoryValues, value)
                                );

                                const fallbackCategoryRegexes = buildRegexArray(
                                        Array.from(fallbackCategoryValues)
                                );

                                if (fallbackCategoryRegexes.length > 0) {
                                        ensureAndConditions(query).push({
                                                category: { $in: fallbackCategoryRegexes },
                                        });
                                } else {
                                        query.category = category;
                                }
                        }
                }

		// Search filter
		if (search) {
			query.$or = [
				{ title: { $regex: search, $options: "i" } },
				{ description: { $regex: search, $options: "i" } },
				{ longDescription: { $regex: search, $options: "i" } },
			];
		}

		// Price range filter - Fixed: Better price handling
		if (minPrice || maxPrice) {
			const priceQuery = {};

			if (minPrice) {
				priceQuery.$gte = parseInt(minPrice);
			}
			if (maxPrice) {
				priceQuery.$lte = parseInt(maxPrice);
			}

			// Check both regular price and sale price
			query.$and = query.$and || [];
			query.$and.push({
				$or: [
					{ price: priceQuery },
					{
						$and: [{ salePrice: { $gt: 0 } }, { salePrice: priceQuery }],
					},
				],
			});
		}

		// Stock filter
		if (inStock === "true") {
			query.inStock = true;
			query.stocks = { $gt: 0 };
		}

		// Discount filter - Fixed: Better discount calculation
		if (discount && parseInt(discount) > 0) {
			const discountValue = parseInt(discount);
			query.$and = query.$and || [];

			query.$and.push({
				$or: [
					// Products with explicit discount field
					{ discount: { $gte: discountValue } },
					// Products with sale price (calculated discount)
					{
						$expr: {
							$and: [
								{ $gt: ["$salePrice", 0] },
								{
									$gte: [
										{
											$multiply: [
												{
													$divide: [
														{ $subtract: ["$price", "$salePrice"] },
														"$price",
													],
												},
												100,
											],
										},
										discountValue,
									],
								},
							],
						},
					},
				],
			});
		}

		// Type filter
		if (type) {
			query.type = type;
		}

		// console.log("Final MongoDB query:", JSON.stringify(query, null, 2));

		// Build sort object
		const sortObj = {};
		sortObj[sort] = order === "desc" ? -1 : 1;

		// Execute query with pagination
		const skip = (page - 1) * limit;
		const products = await Product.find(query)
			.sort(sortObj)
			.skip(skip)
			.limit(limit)
			.populate("reviews", "rating")
			.lean();

		const total = await Product.countDocuments(query);
		const totalPages = Math.ceil(total / limit);

		// console.log(`Found ${products.length} products out of ${total} total`);

		// Transform products for frontend
		const transformedProducts = products.map((product) => {
			const discountPercentage =
				product.salePrice > 0
					? Math.round(
							((product.price - product.salePrice) / product.price) * 100
					  )
					: product.discount || 0;

			const rating =
				product.reviews && product.reviews.length > 0
					? Number(
							(
								product.reviews.reduce((acc, r) => acc + r.rating, 0) /
								product.reviews.length
							).toFixed(1)
					  )
					: 0;

			return {
				id: product._id.toString(),
				title: product.title,
				description: product.description,
				longDescription: product.longDescription,
				price: product.salePrice > 0 ? product.salePrice : product.price,
				originalPrice: product.price,
				salePrice: product.salePrice,
				discount: product.discount,
				discountPercentage,
                                image:
                                        product.images?.find(
                                                (img) =>
                                                        typeof img === "string" && img.trim().length > 0
                                        ) ||
                                        "https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png",
                                images:
                                        Array.isArray(product.images)
                                                ? product.images.filter(
                                                          (img) =>
                                                                  typeof img === "string" &&
                                                                  img.trim().length > 0
                                                  )
                                                : [],
				category: product.category,
				subCategory: product.subCategory,
				inStock: product.inStock,
				stocks: product.stocks,
				status: product.status,
				type: product.type,
				features: product.features || [],
				rating,
				createdAt: product.createdAt,
				updatedAt: product.updatedAt,
			};
		});

		return Response.json({
			success: true,
			products: transformedProducts,
			pagination: {
				currentPage: page,
				totalPages,
				totalProducts: total,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1,
				limit,
			},
		});
	} catch (error) {
		console.error("Products fetch error:", error);
		return Response.json(
			{ success: false, message: "Failed to fetch products" },
			{ status: 500 }
		);
	}
}
