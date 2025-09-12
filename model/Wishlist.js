import mongoose from "mongoose";

const WishlistSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		products: [
			{
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
					required: true,
				},
				addedAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

// Ensure a user can only have one wishlist
WishlistSchema.index({ user: 1 }, { unique: true });

// Prevent duplicate products in the same wishlist
WishlistSchema.index({ user: 1, "products.product": 1 }, { unique: true });

export default mongoose.models.Wishlist ||
	mongoose.model("Wishlist", WishlistSchema);
