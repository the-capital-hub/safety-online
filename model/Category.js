import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},
		description: {
			type: String,
			required: true,
			trim: true,
		},
		slug: {
			type: String,
			unique: true,
			lowercase: true,
		},
		icon: {
			type: String, // URL to icon image
			default: "",
		},
		published: {
			type: Boolean,
			default: true,
		},
		sortOrder: {
			type: Number,
			default: 0,
		},
		productCount: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

// Generate slug before saving
CategorySchema.pre("save", function (next) {
	if (this.isModified("name")) {
		this.slug = this.name
			.toLowerCase()
			.replace(/[^a-zA-Z0-9]/g, "-")
			.replace(/-+/g, "-")
			.replace(/^-|-$/g, "");
	}
	next();
});

export default mongoose.models.Category ||
	mongoose.model("Category", CategorySchema);
