import mongoose from "mongoose";

const { Schema } = mongoose;

const addressFields = {
        tagName: { type: String, required: true },
        building: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        country: { type: String, required: true },
};

const AddressSchema = new Schema(addressFields, { _id: false });

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
                companyAddress: {
                        type: [AddressSchema],
                        default: [],
                },
                primaryPickupAddress: {
                        type: AddressSchema,
                        default: null,
                },
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
		brandName: {
			type: String,
			trim: true,
		},
		brandDescription: {
			type: String,
			trim: true,
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
