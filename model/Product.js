import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		description: { type: String, required: true },
		longDescription: { type: String, required: true },
                images: [{ type: String }],
                productIds: [{ type: String, trim: true }],
		category: { type: String, required: true },
		stocks: { type: Number, required: true },
		price: { type: Number, required: true }, // Treat this as the regular price / MRP
		salePrice: { type: Number, default: 0 },
		discount: { type: Number, default: 0 },

		published: { type: Boolean, default: true },
		inStock: { type: Boolean, default: true },

		// Auto-generated status based on stock levels
		status: {
			type: String,
			default: function () {
				return this.getStockStatus();
			},
		},

		// Product type for categorization
		type: {
			type: String,
			enum: ["featured", "top-selling", "best-selling", "discounted"],
			default: function () {
				// Auto-assign discounted if there's a discount
				if (this.discount > 0 || this.salePrice > 0) {
					return "discounted";
				}
				return "featured"; // Default fallback
			},
		},

		reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],

		// Features array to handle product features
		features: [
			{
				title: {
					type: String,
					required: true,
					trim: true,
				},
				description: {
					type: String,
					required: true,
					trim: true,
				},
			},
		],

		// Generic keywords for search optimization
		keywords: [{ type: String }],

		// More fields as needed
		sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		subCategory: { type: String },
		mainImage: { type: String },
		hsnCode: { type: String },
		brand: { type: String },

		// Product Specifications
		length: { type: Number },
		width: { type: Number },
		height: { type: Number },
		weight: { type: Number },
		colour: { type: String },
		material: { type: String },
		size: { type: String },
	},
	{
		timestamps: true,
	}
);

// Method to generate stock status
ProductSchema.methods.getStockStatus = function () {
	const stock = this.stocks;

	if (stock <= 0) {
		return "Out of Stock";
	} else if (stock < 5) {
		return "Critical Stock - Only few left!";
	} else if (stock < 10) {
		return "Low Stock - Order soon!";
	} else if (stock < 20) {
		return "Limited Stock Available";
	} else if (stock < 30) {
		return "Hurry up, product is selling fast!";
	} else if (stock < 50) {
		return "In Stock";
	} else {
		return "Available";
	}
};

// Method to update stock status
ProductSchema.methods.updateStockStatus = function () {
	this.status = this.getStockStatus();
	this.inStock = this.stocks > 0;
	return this.save();
};

// Pre-save middleware to auto-update status and inStock
ProductSchema.pre("save", function (next) {
	// Update stock status
	this.status = this.getStockStatus();

	// Update inStock boolean
	this.inStock = this.stocks > 0;

	// Auto-assign type based on discount if not explicitly set
	if (
		!this.type ||
		this.isModified("discount") ||
		this.isModified("salePrice")
	) {
		if (this.discount > 0 || this.salePrice > 0) {
			this.type = "discounted";
		}
	}

	next();
});

export default mongoose.models.Product ||
	mongoose.model("Product", ProductSchema);
