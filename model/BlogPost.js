import mongoose from "mongoose";
import { ensureSlug } from "@/lib/slugify.js";

const { Schema } = mongoose;

const COVER_PLACEHOLDER_ALT = "Blog post featured image";

const CoverImageSchema = new Schema(
        {
                url: {
                        type: String,
                        default: "",
                        trim: true,
                },
                alt: {
                        type: String,
                        default: COVER_PLACEHOLDER_ALT,
                        trim: true,
                },
        },
        { _id: false }
);

const AuthorSchema = new Schema(
        {
                name: {
                        type: String,
                        required: true,
                        trim: true,
                        default: "Editorial Team",
                },
                avatar: {
                        type: String,
                        default: "",
                        trim: true,
                },
        },
        { _id: false }
);

const BlogPostSchema = new Schema(
        {
                title: {
                        type: String,
                        required: true,
                        trim: true,
                },
                slug: {
                        type: String,
                        required: true,
                        unique: true,
                        lowercase: true,
                        trim: true,
                },
                excerpt: {
                        type: String,
                        default: "",
                        trim: true,
                },
                content: {
                        type: String,
                        required: true,
                },
                coverImage: {
                        type: CoverImageSchema,
                        default: () => ({})
                },
                author: {
                        type: AuthorSchema,
                        default: () => ({ name: "Editorial Team" })
                },
                status: {
                        type: String,
                        enum: ["draft", "published"],
                        default: "draft",
                        index: true,
                },
                publishedAt: {
                        type: Date,
                        default: null,
                        index: true,
                },
                categories: [
                        {
                                type: Schema.Types.ObjectId,
                                ref: "BlogCategory",
                        },
                ],
                tags: {
                        type: [String],
                        default: [],
                },
                isFeatured: {
                        type: Boolean,
                        default: false,
                        index: true,
                },
                metaTitle: {
                        type: String,
                        default: "",
                        trim: true,
                },
                metaDescription: {
                        type: String,
                        default: "",
                        trim: true,
                },
                metaKeywords: {
                        type: [String],
                        default: [],
                },
                readingTime: {
                        type: Number,
                        default: 0,
                },
        },
        {
                timestamps: true,
        }
);

const sanitizeTagArray = (tags = []) =>
        tags
                .filter(Boolean)
                .map((tag) => tag.toString().trim())
                .filter((tag, index, self) => tag && self.indexOf(tag) === index);

const computeReadingTime = (content = "") => {
        const plainText = content
                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
                .replace(/<[^>]+>/g, " ")
                .replace(/&[a-z]+;/gi, " ");

        const words = plainText
                .split(/\s+/)
                .map((word) => word.trim())
                .filter(Boolean);

        const wordsPerMinute = 200;
        const minutes = Math.ceil(words.length / wordsPerMinute);
        return minutes > 0 ? minutes : 1;
};

BlogPostSchema.pre("validate", function (next) {
        if (this.title && !this.slug) {
                this.slug = ensureSlug(this.title);
        }

        if (this.slug) {
                this.slug = ensureSlug(this.slug);
        }

        if (this.metaKeywords && !Array.isArray(this.metaKeywords)) {
                this.metaKeywords = sanitizeTagArray(
                        this.metaKeywords
                                .toString()
                                .split(",")
                );
        }

        if (!this.author || !this.author.name) {
                this.author = {
                        ...(this.author || {}),
                        name: "Editorial Team",
                };
        }

        next();
});

BlogPostSchema.pre("save", function (next) {
        this.tags = sanitizeTagArray(this.tags);

        if (Array.isArray(this.metaKeywords)) {
                this.metaKeywords = sanitizeTagArray(this.metaKeywords);
        }

        if (this.isModified("content")) {
                this.readingTime = computeReadingTime(this.content);
        }

        if (this.isModified("status")) {
                if (this.status === "published" && !this.publishedAt) {
                        this.publishedAt = new Date();
                }

                if (this.status !== "published") {
                        this.publishedAt = null;
                }
        }

        if (this.coverImage && !this.coverImage.alt) {
                this.coverImage.alt = COVER_PLACEHOLDER_ALT;
        }

        next();
});

BlogPostSchema.index({ title: "text", excerpt: "text", content: "text" });

export default mongoose.models.BlogPost ||
        mongoose.model("BlogPost", BlogPostSchema);
