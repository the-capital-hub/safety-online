import mongoose from "mongoose";

const { Schema } = mongoose;

const SellerBankDetailsSchema = new Schema(
        {
                user: {
                        type: Schema.Types.ObjectId,
                        ref: "User",
                        required: true,
                        unique: true,
                },
                accountHolderName: {
                        type: String,
                        required: true,
                        trim: true,
                },
                accountNumber: {
                        type: String,
                        required: true,
                        trim: true,
                },
                ifscCode: {
                        type: String,
                        required: true,
                        uppercase: true,
                        trim: true,
                },
                bankName: {
                        type: String,
                        required: true,
                        trim: true,
                },
                branchName: {
                        type: String,
                        required: true,
                        trim: true,
                },
        },
        { timestamps: true }
);

SellerBankDetailsSchema.index({ accountNumber: 1, ifscCode: 1 }, { unique: true, sparse: true });

export default mongoose.models.SellerBankDetails ||
        mongoose.model("SellerBankDetails", SellerBankDetailsSchema);
