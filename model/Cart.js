import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	products: [
		{
			product: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Product",
			},
			quantity: Number,
		},
	],
	totalPrice: { type: Number, default: 0 },
	appliedPromo: { type: String },
});

export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);
