import mongoose from "mongoose";

const ReturnSettingsSchema = new mongoose.Schema(
        {
                enabled: {
                        type: Boolean,
                        default: true,
                },
                windowDays: {
                        type: Number,
                        default: 7,
                        min: 0,
                },
                updatedBy: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        default: null,
                },
        },
        { timestamps: true }
);

ReturnSettingsSchema.statics.getOrCreate = async function () {
        const existing = await this.findOne();
        if (existing) {
                return existing;
        }
        return this.create({});
};

const ReturnSettingsModel =
        mongoose.models.ReturnSettings || mongoose.model("ReturnSettings", ReturnSettingsSchema);

export default ReturnSettingsModel;
