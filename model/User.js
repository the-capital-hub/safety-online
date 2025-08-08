import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const AddressSchema = new mongoose.Schema(
	{
		tag: {
			type: String,
			required: true,
			enum: ["home", "office", "other"],
			default: "home",
		},
		name: { type: String, required: true },
		street: { type: String, required: true },
		city: { type: String, required: true },
		state: { type: String, required: true },
		zipCode: { type: String, required: true },
		country: { type: String, default: "India" },
		isDefault: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

const UserSchema = new mongoose.Schema(
	{
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		profilePic: {
			type: String,
			default:
				"https://res.cloudinary.com/drjt9guif/image/upload/v1731063193/TheCapitalHub/startUps/logos/veyaynpessgiy6ifh9ul.webp",
		},
		address: { type: String },
		addresses: [AddressSchema],
		email: { type: String, unique: true, sparse: true },
		mobile: { type: String, unique: true, sparse: true },
		password: { type: String, required: true },
		userType: {
			type: String,
			enum: ["customer", "seller", "admin"],
			default: "customer",
		},
		status: {
			type: String,
			enum: ["active", "inactive", "suspended"],
			default: "active",
		},
		lastLogin: { type: Date },
		isVerified: { type: Boolean, default: false },
	},
	{
		timestamps: true,
	}
);

UserSchema.pre("save", async function () {
	if (!this.isModified("password")) return;
	this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = function (password) {
	return bcrypt.compare(password, this.password);
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
