import mongoose from "mongoose";

const BrandPromotionSchema = new mongoose.Schema(
        {
                brandName: {
                        type: String,
                        required: true,
                        trim: true,
                },
                discountPercentage: {
                        type: Number,
                        default: 0,
                        min: 0,
                        max: 100,
                },
                tagline: {
                        type: String,
                        trim: true,
                        default: "",
                },
                bannerImage: {
                        type: String,
                        required: true,
                        trim: true,
                },
                isActive: {
                        type: Boolean,
                        default: true,
                },
                displayOrder: {
                        type: Number,
                        default: 0,
                },
        },
        {
                timestamps: true,
        }
);

export default mongoose.models.BrandPromotion ||
        mongoose.model("BrandPromotion", BrandPromotionSchema);
