import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Notification from "@/model/Notification";

const normalizeMetadata = (metadata) => {
        if (!metadata) return undefined;

        if (Array.isArray(metadata)) {
                const normalized = metadata
                        .filter((item) => item && typeof item === "object")
                        .map((item) => ({
                                label: String(item.label ?? "").trim(),
                                value: String(item.value ?? "").trim(),
                        }))
                        .filter((item) => item.label && item.value);

                return normalized.length ? normalized : [];
        }

        if (typeof metadata === "object") {
                const normalized = Object.entries(metadata)
                        .filter(([, value]) => value !== undefined && value !== null)
                        .map(([label, value]) => ({
                                label: label
                                        .replace(/([A-Z])/g, " $1")
                                        .replace(/^./, (str) => str.toUpperCase()),
                                value: String(value).trim(),
                        }));

                return normalized.length ? normalized : [];
        }

        if (metadata === null) {
                return [];
        }

        return undefined;
};

export async function PATCH(request, { params }) {
        const { id } = params;
        const payload = await request.json();

        await dbConnect();

        const update = {};

        if (payload.title !== undefined) update.title = payload.title;
        if (payload.message !== undefined) update.message = payload.message;
        if (payload.panel !== undefined) update.panel = payload.panel;
        if (payload.category !== undefined) update.category = payload.category;
        if (payload.severity !== undefined) update.severity = payload.severity;

        const normalizedMetadata = normalizeMetadata(payload.metadata);
        if (normalizedMetadata !== undefined) {
                update.metadata = normalizedMetadata;
        }

        if (payload.actor !== undefined) {
                update.actor = payload.actor
                        ? {
                                  name: payload.actor.name || "",
                                  role: payload.actor.role || "",
                          }
                        : null;
        }

        if (payload.link !== undefined) {
                update.link = payload.link
                        ? {
                                  href: payload.link.href || "",
                                  label: payload.link.label || "View details",
                          }
                        : null;
        }

        if (payload.status !== undefined) {
                update.status = payload.status;
        }

        if (payload.read !== undefined) {
                update.read = Boolean(payload.read);
                update.readAt = update.read
                        ? payload.readAt
                                ? new Date(payload.readAt)
                                : new Date()
                        : null;
        }

        update.updatedAt = new Date();

        try {
                const notification = await Notification.findByIdAndUpdate(id, update, {
                        new: true,
                        runValidators: true,
                }).lean();

                if (!notification) {
                        return NextResponse.json(
                                { message: "Notification not found" },
                                { status: 404 }
                        );
                }

                return NextResponse.json({ notification });
        } catch (error) {
                console.error(`Failed to update notification ${id}`, error);
                return NextResponse.json(
                        { message: "Failed to update notification" },
                        { status: 500 }
                );
        }
}

export async function DELETE(request, { params }) {
        const { id } = params;

        await dbConnect();

        try {
                const notification = await Notification.findByIdAndDelete(id).lean();

                if (!notification) {
                        return NextResponse.json(
                                { message: "Notification not found" },
                                { status: 404 }
                        );
                }

                return NextResponse.json({ success: true });
        } catch (error) {
                console.error(`Failed to delete notification ${id}`, error);
                return NextResponse.json(
                        { message: "Failed to delete notification" },
                        { status: 500 }
                );
        }
}
