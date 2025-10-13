import mongoose from "mongoose";
import { ensureSlug } from "@/lib/slugify.js";

const BlogCategorySchema = new mongoose.Schema(
        {
                name: {
                        type: String,
                        required: true,
                        trim: true,
                        unique: true,
                },
                slug: {
                        type: String,
                        required: true,
                        trim: true,
                        unique: true,
                        lowercase: true,
                },
                description: {
                        type: String,
                        default: "",
                        trim: true,
                },
                accentColor: {
                        type: String,
                        default: "",
                },
        },
        {
                timestamps: true,
        }
);

BlogCategorySchema.pre("validate", function (next) {
        if (this.name && !this.slug) {
                this.slug = ensureSlug(this.name);
        }

        if (this.slug) {
                this.slug = ensureSlug(this.slug);
        }

        next();
});

BlogCategorySchema.index({ name: "text", description: "text" });

export default mongoose.models.BlogCategory ||
        mongoose.model("BlogCategory", BlogCategorySchema);
