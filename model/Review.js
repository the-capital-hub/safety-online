// If your project already has a Review model, keep that and ignore this file.
import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
		title: String,
		images: [String],
		comment: { type: String, required: true },
		rating: {
			type: Number,
			required: true,
			default: 1,
			min: [1, "Rating must be at least 1"],
			max: [5, "Rating cannot exceed 5"],
			validate: {
				validator: (value) =>
					Number.isInteger(value) && value >= 1 && value <= 5,
				message: "Rating must be an integer between 1 and 5",
			},
		},
	},
	{ timestamps: true }
);

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
