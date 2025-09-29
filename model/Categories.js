import mongoose from "mongoose";

const SubCategorySchema = new mongoose.Schema(
        {
                name: {
                        type: String,
                        required: true,
                        trim: true,
                },
                published: {
                        type: Boolean,
                        default: true,
                },
                productCount: {
                        type: Number,
                        default: 0,
                },
        },
        { _id: false }
);

const CategorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},
		subCategories: [SubCategorySchema],
		published: {
			type: Boolean,
			default: true,
		},
		// Number of products in this category and its subcategories
                productCount: {
                        type: Number,
                        default: 0,
                },
                navigationOrder: {
                        type: Number,
                        default: 0,
                        min: 0,
                },
        },
	{
		timestamps: true,
	}
);

export default mongoose.models.Categories ||
	mongoose.model("Categories", CategorySchema);
