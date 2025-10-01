import mongoose from "mongoose";

const MetadataSchema = new mongoose.Schema(
        {
                label: { type: String, trim: true, required: true },
                value: { type: String, trim: true, required: true },
        },
        { _id: false }
);

const ActorSchema = new mongoose.Schema(
        {
                name: { type: String, trim: true },
                role: { type: String, trim: true },
        },
        { _id: false }
);

const LinkSchema = new mongoose.Schema(
        {
                href: { type: String, trim: true },
                label: { type: String, trim: true },
        },
        { _id: false }
);

const NotificationSchema = new mongoose.Schema(
        {
                panel: {
                        type: String,
                        enum: ["admin", "seller", "buyer", "all"],
                        default: "admin",
                },
                category: { type: String, trim: true, default: "general" },
                title: { type: String, required: true, trim: true },
                message: { type: String, trim: true, default: "" },
                severity: {
                        type: String,
                        enum: ["info", "success", "warning", "critical"],
                        default: "info",
                },
                metadata: { type: [MetadataSchema], default: [] },
                actor: { type: ActorSchema, default: null },
                link: { type: LinkSchema, default: null },
                status: {
                        type: String,
                        enum: ["open", "acknowledged", "resolved", "archived"],
                        default: "open",
                },
                read: { type: Boolean, default: false },
                readAt: { type: Date, default: null },
        },
        {
                timestamps: true,
        }
);

NotificationSchema.index({ panel: 1, createdAt: -1 });
NotificationSchema.index({ read: 1, panel: 1 });

export default mongoose.models.Notification ||
        mongoose.model("Notification", NotificationSchema);
