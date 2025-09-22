import mongoose from "mongoose";

const PromocodeSchema = new mongoose.Schema({
        name: { type: String, required: true },
        code: { type: String, unique: true, required: true, sparse: true }, // Unique code for the promocode - 8 characters (Alphanumeric)
        discount: { type: Number, required: true, min: 0, max: 100 }, // Percentage discount
        published: { type: Boolean, default: true },
        recommended: { type: Boolean, default: false },
        status: { type: String, default: "Active" }, // Active, Inactive

        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
});

export default mongoose.models.Promocode ||
	mongoose.model("Promocode", PromocodeSchema);
