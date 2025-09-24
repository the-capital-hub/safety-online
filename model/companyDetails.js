import mongoose from "mongoose";

const { Schema } = mongoose;

const CompanySchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		companyName: {
			type: String,
			required: true,
			trim: true,
		},
		companyAddress: [
			{
				tagName: { type: String, required: true },
				building: { type: String, required: true },
				street: { type: String, required: true },
				city: { type: String, required: true },
				state: { type: String, required: true },
				pincode: { type: String, required: true },
				country: { type: String, required: true },
			},
		],
		companyEmail: {
			type: String,
			required: true,
			lowercase: true,
			trim: true,
		},
		phone: {
			type: String,
			required: true,
		},
		companyLogo: {
			type: String,
		},
		gstinNumber: {
			type: String,
			trim: true,
		},
	},
	{ timestamps: true }
);

export default mongoose.models.Company ||
	mongoose.model("Company", CompanySchema);
