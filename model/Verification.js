import mongoose from "mongoose";

const VerificationSchema = new mongoose.Schema({
	email: { type: String, unique: true },
	code: String,
	expiresAt: Date,
});

export default mongoose.models.Verification ||
	mongoose.model("Verification", VerificationSchema);
