import Category from "@/model/Categories.js";
import Product from "@/model/Product.js";

const normalizeName = (value) =>
        typeof value === "string" ? value.trim().toLowerCase() : "";

const normalizeSubCategories = (subCategories = []) =>
        Array.isArray(subCategories)
                ? subCategories.map((subCategory) => ({
                              ...subCategory,
                              published:
                                      subCategory?.published !== undefined
                                              ? !!subCategory.published
                                              : true,
                              productCount: Number(subCategory?.productCount) || 0,
                      }))
                : [];

export async function attachProductCountsToCategories(
        categories,
        { persist = false } = {}
) {
        const safeCategories = Array.isArray(categories)
                ? categories.map((category) => ({
                          ...category,
                          subCategories: normalizeSubCategories(category.subCategories),
                  }))
                : [];

        if (safeCategories.length === 0) {
                return safeCategories;
        }

        const productCounts = await Product.aggregate([
                {
                        $match: {
                                published: true,
                                category: { $exists: true, $ne: null, $ne: "" },
                        },
                },
                {
                        $project: {
                                category: {
                                        $toLower: {
                                                $trim: { input: "$category" },
                                        },
                                },
                                subCategory: {
                                        $toLower: {
                                                $trim: {
                                                        input: { $ifNull: ["$subCategory", ""] },
                                                },
                                        },
                                },
                        },
                },
                {
                        $group: {
                                _id: {
                                        category: "$category",
                                        subCategory: "$subCategory",
                                },
                                count: { $sum: 1 },
                        },
                },
        ]);

        const categoryTotals = new Map();
        const subCategoryTotals = new Map();

        productCounts.forEach(({ _id, count }) => {
                const categoryKey = normalizeName(_id?.category);
                if (!categoryKey) {
                        return;
                }

                categoryTotals.set(
                        categoryKey,
                        (categoryTotals.get(categoryKey) || 0) + count
                );

                const subKey = normalizeName(_id?.subCategory);
                if (!subKey) {
                        return;
                }

                if (!subCategoryTotals.has(categoryKey)) {
                        subCategoryTotals.set(categoryKey, new Map());
                }

                const subMap = subCategoryTotals.get(categoryKey);
                subMap.set(subKey, (subMap.get(subKey) || 0) + count);
        });

        const categoriesWithCounts = safeCategories.map((category) => {
                const normalizedCategoryName = normalizeName(category.name);
                const productCount = categoryTotals.get(normalizedCategoryName) || 0;

                const subCategories = category.subCategories.map((subCategory) => {
                        const normalizedSubName = normalizeName(subCategory.name);
                        const subCategoryCount =
                                subCategoryTotals.get(normalizedCategoryName)?.get(
                                        normalizedSubName
                                ) || 0;

                        return {
                                ...subCategory,
                                productCount: subCategoryCount,
                        };
                });

                return {
                        ...category,
                        productCount,
                        subCategories,
                };
        });

        if (persist) {
                const operations = categoriesWithCounts
                        .map((category, index) => {
                                const sourceCategory = categories[index];
                                const id = sourceCategory?._id;

                                if (!id) {
                                        return null;
                                }

                                return {
                                        updateOne: {
                                                filter: { _id: id },
                                                update: {
                                                        $set: {
                                                                productCount: category.productCount,
                                                                subCategories: category.subCategories,
                                                        },
                                                },
                                        },
                                };
                        })
                        .filter(Boolean);

                if (operations.length > 0) {
                        await Category.bulkWrite(operations);
                }
        }

        return categoriesWithCounts;
}
