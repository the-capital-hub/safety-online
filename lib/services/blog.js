import mongoose from "mongoose";
import { dbConnect } from "@/lib/dbConnect.js";
import BlogPost from "@/model/BlogPost.js";
import BlogCategory from "@/model/BlogCategory.js";
import { ensureSlug } from "@/lib/slugify.js";

const { ObjectId } = mongoose.Types;

const toObjectIdArray = (values = []) =>
        values
                .map((value) => {
                        try {
                                return new ObjectId(value);
                        } catch (error) {
                                return null;
                        }
                })
                .filter(Boolean);

const escapeRegExp = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const sanitizeStringArray = (values = []) =>
        values
                .filter(Boolean)
                .map((value) => value.toString().trim())
                .filter((value, index, self) => value && self.indexOf(value) === index);

const extractCategoryIdentifiers = (categories = []) =>
        categories
                .map((category) => {
                        if (!category) return null;

                        if (typeof category === "string") {
                                return category;
                        }

                        if (typeof category === "object") {
                                if (category._id) {
                                        return category._id.toString?.() || category._id;
                                }

                                if (category.id) {
                                        return category.id.toString?.() || category.id;
                                }
                        }

                        try {
                                return category.toString?.();
                        } catch (error) {
                                return null;
                        }
                })
                .filter(Boolean);

const serializeDocument = (doc) => {
        if (!doc) return null;

        const serialized = JSON.parse(JSON.stringify(doc));

        if (serialized?._id) {
                serialized._id = serialized._id.toString();
        }

        if (serialized?.categories?.length) {
                serialized.categories = serialized.categories.map((category) => ({
                        ...category,
                        _id: category._id?.toString?.() || category._id,
                }));
        }

        return serialized;
};

const basePostProjection = {
        title: 1,
        slug: 1,
        excerpt: 1,
        coverImage: 1,
        author: 1,
        status: 1,
        publishedAt: 1,
        createdAt: 1,
        updatedAt: 1,
        categories: 1,
        tags: 1,
        isFeatured: 1,
        metaTitle: 1,
        metaDescription: 1,
        metaKeywords: 1,
        readingTime: 1,
};

const buildSearchQuery = (search) => {
        if (!search) return {};

        const regex = new RegExp(escapeRegExp(search), "i");

        return {
                $or: [
                        { title: { $regex: regex } },
                        { excerpt: { $regex: regex } },
                        { tags: { $elemMatch: { $regex: regex } } },
                ],
        };
};

export async function getPublishedBlogPosts(options = {}) {
        const {
                page = 1,
                limit = 9,
                search = "",
                category,
                tag,
        } = options;

        await dbConnect();

        const numericPage = Math.max(Number.parseInt(page, 10) || 1, 1);
        const numericLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 9, 1), 24);
        const skip = (numericPage - 1) * numericLimit;

        const baseQuery = { status: "published" };

        if (search) {
                Object.assign(baseQuery, buildSearchQuery(search));
        }

        let categoryDoc = null;

        if (category) {
                categoryDoc = await BlogCategory.findOne({ slug: category })
                        .select("_id name slug")
                        .lean();

                if (!categoryDoc) {
                        return {
                                posts: [],
                                categories: await getBlogCategoriesWithCounts(),
                                tags: await getBlogTagsWithCounts(),
                                pagination: {
                                        page: numericPage,
                                        limit: numericLimit,
                                        totalPages: 0,
                                        totalItems: 0,
                                },
                        };
                }

                baseQuery.categories = categoryDoc._id;
        }

        if (tag) {
                baseQuery.tags = {
                        $elemMatch: {
                                $regex: new RegExp(`^${escapeRegExp(tag)}$`, "i"),
                        },
                };
        }

        const [posts, total, categories, tagsWithCounts] = await Promise.all([
                BlogPost.find(baseQuery)
                        .select({ ...basePostProjection, content: 0 })
                        .populate("categories", "name slug accentColor")
                        .sort({ isFeatured: -1, publishedAt: -1, createdAt: -1 })
                        .skip(skip)
                        .limit(numericLimit)
                        .lean(),
                BlogPost.countDocuments(baseQuery),
                getBlogCategoriesWithCounts(),
                getBlogTagsWithCounts(),
        ]);

        return {
                posts: posts.map(serializeDocument),
                categories,
                tags: tagsWithCounts,
                activeCategory: categoryDoc ? serializeDocument(categoryDoc) : null,
                pagination: {
                        page: numericPage,
                        limit: numericLimit,
                        totalPages: Math.ceil(total / numericLimit),
                        totalItems: total,
                },
        };
}

export async function getFeaturedBlogPosts(limit = 3) {
        await dbConnect();

        const numericLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 3, 1), 6);

        const posts = await BlogPost.find({ status: "published", isFeatured: true })
                .select({ ...basePostProjection, excerpt: 1 })
                .populate("categories", "name slug accentColor")
                .sort({ publishedAt: -1, updatedAt: -1 })
                .limit(numericLimit)
                .lean();

        return {
                posts: posts.map(serializeDocument),
        };
}

export async function getBlogPostBySlug(slug, { includeDraft = false } = {}) {
        if (!slug) return null;

        await dbConnect();

        const query = { slug };

        if (!includeDraft) {
                query.status = "published";
        }

        const post = await BlogPost.findOne(query)
                .populate("categories", "name slug accentColor")
                .lean();

        return serializeDocument(post);
}

export async function getBlogPostById(postId) {
        if (!postId || !ObjectId.isValid(postId)) {
                return null;
        }

        await dbConnect();

        const post = await BlogPost.findById(postId)
                .populate("categories", "name slug accentColor")
                .lean();

        return serializeDocument(post);
}

export async function getRelatedBlogPosts(reference, options = {}) {
        const { limit = 3 } = options;

        if (!reference) return [];

        const numericLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 3, 1), 6);

        if (numericLimit === 0) {
                return [];
        }

        const basePost =
                typeof reference === "object" && reference !== null
                        ? reference
                        : await getBlogPostById(reference);

        if (!basePost?._id) {
                return [];
        }

        await dbConnect();

        const excludedIds = new Set();
        const addExcludedId = (value) => {
                if (!value) return;

                const raw = value.toString?.() ?? value;

                if (raw && ObjectId.isValid(raw)) {
                        excludedIds.add(new ObjectId(raw).toString());
                }
        };

        addExcludedId(basePost._id);

        const getExcludedObjectIds = () =>
                Array.from(excludedIds).map((id) => new ObjectId(id));

        const tags = sanitizeStringArray(basePost.tags);
        const categoryIds = toObjectIdArray(extractCategoryIdentifiers(basePost.categories));

        const results = [];

        const fetchBatch = async (additionalFilter = {}) => {
                if (results.length >= numericLimit) return;

                const filter = {
                        status: "published",
                        _id: { $nin: getExcludedObjectIds() },
                        ...additionalFilter,
                };

                const docs = await BlogPost.find(filter)
                        .select({ ...basePostProjection, content: 0 })
                        .populate("categories", "name slug accentColor")
                        .sort({ publishedAt: -1, createdAt: -1 })
                        .limit(numericLimit - results.length)
                        .lean();

                for (const doc of docs) {
                        addExcludedId(doc._id);
                        results.push(serializeDocument(doc));
                }
        };

        if (tags.length) {
                await fetchBatch({
                        tags: {
                                $in: tags.map((tag) => new RegExp(`^${escapeRegExp(tag)}$`, "i")),
                        },
                });
        }

        if (results.length < numericLimit && categoryIds.length) {
                await fetchBatch({
                        categories: { $in: categoryIds },
                });
        }

        if (results.length < numericLimit) {
                await fetchBatch();
        }

        return results;
}

export async function getBlogCategoriesWithCounts() {
        await dbConnect();

        const [categories, counts] = await Promise.all([
                BlogCategory.find({}).sort({ name: 1 }).lean(),
                BlogPost.aggregate([
                        { $match: { status: "published" } },
                        { $unwind: "$categories" },
                        {
                                $group: {
                                        _id: "$categories",
                                        count: { $sum: 1 },
                                },
                        },
                ]),
        ]);

        const countMap = new Map(
                counts.map((entry) => [entry._id.toString(), entry.count])
        );

        return categories.map((category) => ({
                ...serializeDocument(category),
                postCount: countMap.get(category._id.toString()) || 0,
        }));
}

export async function getBlogTagsWithCounts() {
        await dbConnect();

        const results = await BlogPost.aggregate([
                { $match: { status: "published", tags: { $exists: true, $ne: [] } } },
                { $unwind: "$tags" },
                {
                        $group: {
                                _id: "$tags",
                                count: { $sum: 1 },
                        },
                },
                { $sort: { count: -1, _id: 1 } },
        ]);

        return results.map((entry) => ({
                label: entry._id,
                count: entry.count,
        }));
}

export async function getAdminBlogPosts(options = {}) {
        const {
                page = 1,
                limit = 10,
                search = "",
                status = "all",
                category = "",
                tag = "",
        } = options;

        await dbConnect();

        const numericPage = Math.max(Number.parseInt(page, 10) || 1, 1);
        const numericLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 10, 1), 50);
        const skip = (numericPage - 1) * numericLimit;

        const query = {};

        if (status !== "all") {
                query.status = status;
        }

        if (search) {
                Object.assign(query, buildSearchQuery(search));
        }

        if (category) {
                try {
                        query.categories = new ObjectId(category);
                } catch (error) {
                        query.categories = null;
                }
        }

        if (tag) {
                query.tags = {
                        $elemMatch: {
                                $regex: new RegExp(`^${escapeRegExp(tag)}$`, "i"),
                        },
                };
        }

        const [posts, total, categories, tagsWithCounts] = await Promise.all([
                BlogPost.find(query)
                        .select(basePostProjection)
                        .populate("categories", "name slug")
                        .sort({ createdAt: -1 })
                        .skip(skip)
                        .limit(numericLimit)
                        .lean(),
                BlogPost.countDocuments(query),
                BlogCategory.find({}).sort({ name: 1 }).lean(),
                BlogPost.distinct("tags", {}),
        ]);

        return {
                posts: posts.map(serializeDocument),
                categories: categories.map(serializeDocument),
                tags: sanitizeStringArray(tagsWithCounts),
                pagination: {
                        page: numericPage,
                        limit: numericLimit,
                        totalPages: Math.ceil(total / numericLimit),
                        totalItems: total,
                },
        };
}

export async function createBlogPost(payload) {
        await dbConnect();

        const {
                title,
                slug,
                excerpt,
                content,
                coverImage,
                author,
                status = "draft",
                categories = [],
                tags = [],
                isFeatured = false,
                metaTitle,
                metaDescription,
                metaKeywords = [],
        } = payload;

        if (!title || !content) {
                throw new Error("Title and content are required");
        }

        const normalizedSlug = ensureSlug(slug || title);

        const existing = await BlogPost.findOne({ slug: normalizedSlug }).lean();

        if (existing) {
                throw new Error("A blog post with this slug already exists");
        }

        const post = await BlogPost.create({
                title,
                slug: normalizedSlug,
                excerpt,
                content,
                coverImage,
                author,
                status,
                categories: toObjectIdArray(categories),
                tags: sanitizeStringArray(tags),
                isFeatured,
                metaTitle,
                metaDescription,
                metaKeywords: sanitizeStringArray(
                        Array.isArray(metaKeywords)
                                ? metaKeywords
                                : metaKeywords?.toString().split(",") ?? []
                ),
        });

        return serializeDocument(await post.populate("categories", "name slug"));
}

export async function updateBlogPost(postId, payload) {
        await dbConnect();

        if (!ObjectId.isValid(postId)) {
                throw new Error("Invalid post identifier");
        }

        const {
                title,
                slug,
                excerpt,
                content,
                coverImage,
                author,
                status,
                categories = [],
                tags = [],
                isFeatured,
                metaTitle,
                metaDescription,
                metaKeywords = [],
        } = payload;

        const normalizedSlug = slug ? ensureSlug(slug) : undefined;

        if (normalizedSlug) {
                const duplicate = await BlogPost.findOne({
                        slug: normalizedSlug,
                        _id: { $ne: postId },
                }).lean();

                if (duplicate) {
                        throw new Error("Another post already uses this slug");
                }
        }

        const update = {
                title,
                excerpt,
                content,
                coverImage,
                author,
                categories: toObjectIdArray(categories),
                tags: sanitizeStringArray(tags),
                metaTitle,
                metaDescription,
                metaKeywords: sanitizeStringArray(
                        Array.isArray(metaKeywords)
                                ? metaKeywords
                                : metaKeywords?.toString().split(",") ?? []
                ),
        };

        if (normalizedSlug) {
                update.slug = normalizedSlug;
        }

        if (typeof isFeatured === "boolean") {
                update.isFeatured = isFeatured;
        }

        if (status) {
                update.status = status;
        }

        const updated = await BlogPost.findByIdAndUpdate(postId, update, {
                new: true,
                runValidators: true,
        })
                .populate("categories", "name slug")
                .lean();

        if (!updated) {
                throw new Error("Blog post not found");
        }

        return serializeDocument(updated);
}

export async function deleteBlogPost(postId) {
        await dbConnect();

        if (!ObjectId.isValid(postId)) {
                throw new Error("Invalid post identifier");
        }

        const deleted = await BlogPost.findByIdAndDelete(postId).lean();

        if (!deleted) {
                throw new Error("Blog post not found");
        }

        return serializeDocument(deleted);
}

export async function createBlogCategory(payload) {
        await dbConnect();

        const { name, slug, description, accentColor } = payload;

        if (!name) {
                throw new Error("Category name is required");
        }

        const normalizedSlug = ensureSlug(slug || name);

        const existing = await BlogCategory.findOne({
                $or: [{ slug: normalizedSlug }, { name: name.trim() }],
        }).lean();

        if (existing) {
                throw new Error("A category with this name or slug already exists");
        }

        const category = await BlogCategory.create({
                name,
                slug: normalizedSlug,
                description,
                accentColor,
        });

        return serializeDocument(category);
}

export async function updateBlogCategory(categoryId, payload) {
        await dbConnect();

        if (!ObjectId.isValid(categoryId)) {
                throw new Error("Invalid category identifier");
        }

        const { name, slug, description, accentColor } = payload;

        const update = {};

        if (name) {
                update.name = name;
        }

        if (slug) {
                update.slug = ensureSlug(slug);
        }

        if (description !== undefined) {
                update.description = description;
        }

        if (accentColor !== undefined) {
                update.accentColor = accentColor;
        }

        if (update.slug) {
                const duplicate = await BlogCategory.findOne({
                        slug: update.slug,
                        _id: { $ne: categoryId },
                }).lean();

                if (duplicate) {
                        throw new Error("Another category already uses this slug");
                }
        }

        if (update.name) {
                const duplicateName = await BlogCategory.findOne({
                        name: update.name,
                        _id: { $ne: categoryId },
                }).lean();

                if (duplicateName) {
                        throw new Error("Another category already uses this name");
                }
        }

        const category = await BlogCategory.findByIdAndUpdate(categoryId, update, {
                new: true,
                runValidators: true,
        }).lean();

        if (!category) {
                throw new Error("Category not found");
        }

        return serializeDocument(category);
}

export async function deleteBlogCategory(categoryId) {
        await dbConnect();

        if (!ObjectId.isValid(categoryId)) {
                throw new Error("Invalid category identifier");
        }

        const isCategoryInUse = await BlogPost.exists({
                categories: categoryId,
        });

        if (isCategoryInUse) {
                throw new Error(
                        "Cannot delete a category that is associated with existing posts"
                );
        }

        const deleted = await BlogCategory.findByIdAndDelete(categoryId).lean();

        if (!deleted) {
                throw new Error("Category not found");
        }

        return serializeDocument(deleted);
}
