// app/api/products/route.js

import { dbConnect } from "@/lib/dbConnect.js";
import Product from "@/model/Product.js";
import Categories from "@/model/Categories";
import { ensureSlug } from "@/lib/slugify.js";

const normalizeText = (value = "") =>
        value
                .toString()
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, " ")
                .replace(/\s+/g, " ")
                .trim();

const SYNONYM_GROUPS = [
        ["ps5", "playstation 5", "play station 5", "sony ps5", "sony playstation 5"],
        ["xbox", "xbox series x", "xbox series s", "microsoft xbox"],
        ["nintendo switch", "switch console", "nintendo console"],
        ["iphone", "apple iphone", "apple phone", "ios phone"],
        ["ipad", "apple ipad", "apple tablet"],
        ["airpods", "air pods", "apple earbuds"],
        ["macbook", "apple laptop", "mac book", "mac notebook"],
        ["laptop", "notebook", "ultrabook", "computer", "pc"],
        ["smartphone", "mobile phone", "cell phone"],
        ["tv", "television", "smart tv", "led tv"],
        ["dslr", "camera", "digital camera"],
        ["earbuds", "ear phones", "earphones", "wireless earbuds"],
        ["headphones", "headset", "audio headset"],
        ["fridge", "refrigerator"],
        ["washing machine", "washer"],
        ["ac", "air conditioner"],
        ["tab", "tablet"],
];

const buildSynonymMap = () => {
        const synonymMap = new Map();

        SYNONYM_GROUPS.forEach((group) => {
                const normalizedGroup = group
                        .map((term) => normalizeText(term))
                        .filter(Boolean);

                normalizedGroup.forEach((term) => {
                        if (!synonymMap.has(term)) {
                                synonymMap.set(term, new Set());
                        }

                        normalizedGroup.forEach((otherTerm) => {
                                if (otherTerm !== term) {
                                        synonymMap.get(term).add(otherTerm);
                                }
                        });
                });
        });

        return synonymMap;
};

const SYNONYM_MAP = buildSynonymMap();

const getSynonyms = (term = "") => {
        const normalizedTerm = normalizeText(term);

        if (!normalizedTerm) {
                return [];
        }

        const synonyms = SYNONYM_MAP.get(normalizedTerm);

        if (!synonyms) {
                return [];
        }

        return Array.from(synonyms);
};

const levenshtein = (a = "", b = "") => {
        const strA = a || "";
        const strB = b || "";

        const matrix = Array.from({ length: strB.length + 1 }, () =>
                Array(strA.length + 1).fill(0)
        );

        for (let i = 0; i <= strB.length; i += 1) {
                matrix[i][0] = i;
        }

        for (let j = 0; j <= strA.length; j += 1) {
                matrix[0][j] = j;
        }

        for (let i = 1; i <= strB.length; i += 1) {
                for (let j = 1; j <= strA.length; j += 1) {
                        if (strB[i - 1] === strA[j - 1]) {
                                matrix[i][j] = matrix[i - 1][j - 1];
                        } else {
                                matrix[i][j] = Math.min(
                                        matrix[i - 1][j] + 1,
                                        matrix[i][j - 1] + 1,
                                        matrix[i - 1][j - 1] + 1
                                );
                        }
                }
        }

        return matrix[strB.length][strA.length];
};

const computeDiscountPercentage = (product) => {
        if (product?.salePrice > 0 && product?.price > 0) {
                return Math.round(
                        ((product.price - product.salePrice) / product.price) * 100
                );
        }

        return product?.discount || 0;
};

const computeRatingValue = (product) => {
        if (Array.isArray(product?.reviews) && product.reviews.length > 0) {
                const total = product.reviews.reduce(
                        (acc, review) => acc + (review?.rating || 0),
                        0
                );

                return Number((total / product.reviews.length).toFixed(1));
        }

        return Number(product?.rating || 0);
};

const transformProduct = (product) => {
        const discountPercentage = computeDiscountPercentage(product);
        const rating = computeRatingValue(product);

        return {
                id: product._id?.toString(),
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
                                (img) => typeof img === "string" && img.trim().length > 0
                        ) ||
                        "https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png",
                images: Array.isArray(product.images)
                        ? product.images.filter(
                                  (img) => typeof img === "string" && img.trim().length > 0
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
                brand: product.brand,
                keywords: product.keywords || [],
                slug: ensureSlug(product.title || ""),
        };
};

const computeClosenessScore = (normalizedQuery, targetText) => {
        const normalizedTarget = normalizeText(targetText);

        if (!normalizedQuery || !normalizedTarget) {
                return 0;
        }

        if (normalizedQuery === normalizedTarget) {
                return 100;
        }

        const distance = levenshtein(normalizedQuery, normalizedTarget);
        const maxLength = Math.max(normalizedQuery.length, normalizedTarget.length) || 1;

        return Math.max(0, Math.round(((maxLength - distance) / maxLength) * 100));
};

const computeRelevanceScore = (
        product,
        normalizedQuery,
        queryTokens,
        querySynonyms
) => {
        if (!product) {
                return 0;
        }

        const normalizedTitle = normalizeText(product.title);
        const normalizedDescription = normalizeText(product.description);
        const normalizedLongDescription = normalizeText(product.longDescription);
        const normalizedBrand = normalizeText(product.brand);
        const normalizedCategory = normalizeText(product.category);
        const normalizedSubCategory = normalizeText(product.subCategory);
        const normalizedType = normalizeText(product.type);
        const keywordValues = Array.isArray(product.keywords)
                ? product.keywords.map((kw) => normalizeText(kw)).filter(Boolean)
                : [];

        const allTokenCandidates = new Set(
                [
                        ...normalizedTitle.split(" "),
                        ...normalizedDescription.split(" "),
                        ...normalizedLongDescription.split(" "),
                        ...normalizedBrand.split(" "),
                        ...normalizedCategory.split(" "),
                        ...normalizedSubCategory.split(" "),
                        ...normalizedType.split(" "),
                        ...keywordValues.flatMap((kw) => kw.split(" ")),
                ].filter(Boolean)
        );

        const allTextValues = [
                normalizedTitle,
                normalizedDescription,
                normalizedLongDescription,
                normalizedBrand,
                normalizedCategory,
                normalizedSubCategory,
                normalizedType,
                ...keywordValues,
        ].filter(Boolean);

        let score = 0;

        if (normalizedTitle === normalizedQuery && normalizedQuery) {
                score += 120;
        }

        if (
                normalizedQuery &&
                keywordValues.some((keyword) => keyword === normalizedQuery)
        ) {
                score += 90;
        }

        if (normalizedQuery && normalizedTitle.includes(normalizedQuery)) {
                score += 60;
        }

        if (normalizedQuery && normalizedDescription.includes(normalizedQuery)) {
                score += 30;
        }

        if (normalizedQuery && normalizedLongDescription.includes(normalizedQuery)) {
                score += 15;
        }

        if (normalizedQuery && normalizedBrand.includes(normalizedQuery)) {
                score += 20;
        }

        if (
                normalizedQuery &&
                (normalizedCategory.includes(normalizedQuery) ||
                        normalizedSubCategory.includes(normalizedQuery))
        ) {
                score += 15;
        }

        let matchedTokens = 0;

        queryTokens.forEach((token) => {
                const normalizedToken = normalizeText(token);

                if (!normalizedToken) {
                        return;
                }

                if (allTokenCandidates.has(normalizedToken)) {
                        score += 22;
                        matchedTokens += 1;
                        return;
                }

                const partialMatch = Array.from(allTokenCandidates).some((candidate) => {
                        if (!candidate) {
                                return false;
                        }

                        return (
                                candidate.includes(normalizedToken) ||
                                normalizedToken.includes(candidate)
                        );
                });

                if (partialMatch) {
                        score += 15;
                        matchedTokens += 1;
                        return;
                }

                const tokenSynonyms = getSynonyms(normalizedToken);
                const synonymMatch = tokenSynonyms.some((synonym) => {
                        const normalizedSynonym = normalizeText(synonym);

                        if (!normalizedSynonym) {
                                return false;
                        }

                        if (allTokenCandidates.has(normalizedSynonym)) {
                                return true;
                        }

                        return allTextValues.some((value) =>
                                value.includes(normalizedSynonym)
                        );
                });

                if (synonymMatch) {
                        score += 12;
                        matchedTokens += 1;
                        return;
                }

                const distances = Array.from(allTokenCandidates).map((candidate) =>
                        levenshtein(normalizedToken, candidate)
                );

                const minDistance =
                        distances.length > 0
                                ? Math.min(...distances)
                                : Number.POSITIVE_INFINITY;

                if (
                        Number.isFinite(minDistance) &&
                        minDistance <= Math.max(2, Math.floor(normalizedToken.length / 3))
                ) {
                        score += Math.max(8, 16 - minDistance * 4);
                        matchedTokens += 1;
                }
        });

        if (queryTokens.length > 0 && matchedTokens === queryTokens.length) {
                score += 25;
        } else if (
                queryTokens.length > 0 &&
                matchedTokens >= Math.ceil(queryTokens.length / 2)
        ) {
                score += 15;
        }

        if (Array.isArray(querySynonyms) && querySynonyms.length > 0) {
                const synonymMatch = querySynonyms.some((synonymPhrase) => {
                        const normalizedSynonym = normalizeText(synonymPhrase);

                        if (!normalizedSynonym) {
                                return false;
                        }

                        return allTextValues.some((value) =>
                                value.includes(normalizedSynonym)
                        );
                });

                if (synonymMatch) {
                        score += 10;
                }
        }

        const ratingValue = computeRatingValue(product);
        score += Number(ratingValue || 0) * 2;

        const discountPercentage = computeDiscountPercentage(product);

        if (discountPercentage > 0) {
                score += Math.min(10, discountPercentage / 5);
        }

        return Math.round(score);
};

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
                                        { name: 1, subCategories: 1, navigationOrder: 1 }
                                )
                                        .sort({ navigationOrder: 1, name: 1 })
                                        .lean();
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

                const searchFields = [
                        "title",
                        "description",
                        "longDescription",
                        "keywords",
                        "brand",
                        "category",
                        "subCategory",
                ];

                const normalizedSearch = normalizeText(search || "");
                const searchTokens = normalizedSearch.split(" ").filter(Boolean);
                const querySynonymPhrases = [];
                let searchApplied = false;

                if (normalizedSearch) {
                        searchApplied = true;

                        const synonymsForSearch = new Set([
                                ...getSynonyms(normalizedSearch),
                        ]);

                        searchTokens.forEach((token) => {
                                getSynonyms(token).forEach((synonym) => {
                                        synonymsForSearch.add(synonym);
                                });
                        });

                        const andConditions = ensureAndConditions(query);

                        searchTokens.forEach((token) => {
                                const tokenVariants = new Set([token]);
                                getSynonyms(token).forEach((synonym) =>
                                        tokenVariants.add(synonym)
                                );

                                const tokenConditions = [];

                                tokenVariants.forEach((variant) => {
                                        const variantOptions = new Set([
                                                variant,
                                                ...createNameVariants(variant),
                                        ]);

                                        variantOptions.forEach((option) => {
                                                const normalizedOption = option
                                                        ?.toString()
                                                        .trim();

                                                if (!normalizedOption) {
                                                        return;
                                                }

                                                const regex = new RegExp(
                                                        escapeRegex(normalizedOption),
                                                        "i"
                                                );

                                                searchFields.forEach((field) => {
                                                        tokenConditions.push({
                                                                [field]: regex,
                                                        });
                                                });
                                        });
                                });

                                const fuzzyPattern = token
                                        .split("")
                                        .map((char) => escapeRegex(char))
                                        .join(".*");

                                if (fuzzyPattern) {
                                        const fuzzyRegex = new RegExp(
                                                fuzzyPattern,
                                                "i"
                                        );

                                        searchFields.forEach((field) => {
                                                tokenConditions.push({
                                                        [field]: fuzzyRegex,
                                                });
                                        });
                                }

                                if (tokenConditions.length > 0) {
                                        andConditions.push({
                                                $or: tokenConditions,
                                        });
                                }
                        });

                        const combinedPhrases = new Set([
                                normalizedSearch,
                                ...Array.from(synonymsForSearch).map((value) =>
                                        normalizeText(value)
                                ),
                        ]);

                        combinedPhrases.forEach((phrase) => {
                                if (!phrase) {
                                        return;
                                }

                                querySynonymPhrases.push(phrase);
                        });

                        const phrasePatterns = [];

                        combinedPhrases.forEach((phrase) => {
                                if (!phrase) {
                                        return;
                                }

                                const phraseTokens = phrase.split(" ").filter(Boolean);

                                if (phraseTokens.length === 0) {
                                        return;
                                }

                                const pattern = phraseTokens
                                        .map((token) => `(?=.*${escapeRegex(token)})`)
                                        .join("");

                                phrasePatterns.push(new RegExp(`${pattern}.*`, "i"));
                        });

                        if (phrasePatterns.length > 0) {
                                const phraseConditions = [];

                                phrasePatterns.forEach((regex) => {
                                        searchFields.forEach((field) => {
                                                phraseConditions.push({
                                                        [field]: regex,
                                                });
                                        });
                                });

                                if (phraseConditions.length > 0) {
                                        andConditions.push({
                                                $or: phraseConditions,
                                        });
                                }
                        }
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

                const skip = (page - 1) * limit;

                if (searchApplied) {
                        const candidateLimit = Math.min(
                                Math.max(limit * (page + 2), 80),
                                400
                        );

                        const candidateProducts = await Product.find(query)
                                .sort({ createdAt: -1 })
                                .limit(candidateLimit)
                                .populate("reviews", "rating")
                                .lean();

                        const uniqueSynonymPhrases = Array.from(
                                new Set(querySynonymPhrases)
                        );

                        const scoredProducts = candidateProducts.map((product) => {
                                const transformed = transformProduct(product);
                                const score = computeRelevanceScore(
                                        product,
                                        normalizedSearch,
                                        searchTokens,
                                        uniqueSynonymPhrases
                                );

                                return { ...transformed, score };
                        });

                        const relevantProducts = scoredProducts.filter(
                                (product) => product.score > 0
                        );

                        const sortedProducts = (relevantProducts.length > 0
                                ? relevantProducts
                                : scoredProducts
                        ).sort((a, b) => {
                                if (b.score === a.score) {
                                        return (
                                                new Date(b.createdAt).getTime() -
                                                new Date(a.createdAt).getTime()
                                        );
                                }

                                return b.score - a.score;
                        });

                        let suggestions = [];

                        if (normalizedSearch && relevantProducts.length === 0) {
                                let suggestionPool = sortedProducts;

                                if (suggestionPool.length === 0) {
                                        const fallbackRaw = await Product.find({ published: true })
                                                .sort({ createdAt: -1 })
                                                .limit(20)
                                                .populate("reviews", "rating")
                                                .lean();

                                        suggestionPool = fallbackRaw
                                                .map((product) => {
                                                        const transformed = transformProduct(product);
                                                        const score = computeClosenessScore(
                                                                normalizedSearch,
                                                                product.title
                                                        );

                                                        return { ...transformed, score };
                                                })
                                                .sort((a, b) => b.score - a.score);
                                }

                                suggestions = suggestionPool.slice(0, 5).map((product) => ({
                                        id: product.id,
                                        title: product.title,
                                        description: product.description,
                                        score: product.score,
                                        slug: product.slug,
                                }));
                        }

                        const total = sortedProducts.length;
                        const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
                        const paginatedProducts = sortedProducts.slice(
                                skip,
                                skip + limit
                        );

                        return Response.json({
                                success: true,
                                products: paginatedProducts,
                                suggestions,
                                pagination: {
                                        currentPage: page,
                                        totalPages,
                                        totalProducts: total,
                                        hasNextPage: page < totalPages,
                                        hasPrevPage: page > 1,
                                        limit,
                                },
                        });
                }

                const products = await Product.find(query)
                        .sort(sortObj)
                        .skip(skip)
                        .limit(limit)
                        .populate("reviews", "rating")
                        .lean();

                const total = await Product.countDocuments(query);
                const totalPages = Math.ceil(total / limit);

                const transformedProducts = products.map((product) =>
                        transformProduct(product)
                );

                return Response.json({
                        success: true,
                        products: transformedProducts,
                        suggestions: [],
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
