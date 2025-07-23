import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		comment: {
			type: String,
			required: true,
		},
		rating: {
			type: Number,
			required: true,
			default: 1,
			min: [1, "Rating must be at least 1"],
			max: [5, "Rating cannot exceed 5"],
			validate: {
				validator: function (value) {
					return Number.isInteger(value) && value >= 1 && value <= 5;
				},
				message: "Rating must be an integer between 1 and 5",
			},
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
