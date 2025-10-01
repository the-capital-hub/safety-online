import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Notification from "@/model/Notification";

const normalizeMetadata = (metadata) => {
        if (!metadata) return [];

        if (Array.isArray(metadata)) {
                return metadata
                        .filter((item) => item && typeof item === "object")
                        .map((item) => ({
                                label: String(item.label ?? "").trim(),
                                value: String(item.value ?? "").trim(),
                        }))
                        .filter((item) => item.label && item.value);
        }

        if (typeof metadata === "object") {
                return Object.entries(metadata)
                        .filter(([, value]) => value !== undefined && value !== null)
                        .map(([label, value]) => ({
                                label: label
                                        .replace(/([A-Z])/g, " $1")
                                        .replace(/^./, (str) => str.toUpperCase()),
                                value: String(value).trim(),
                        }));
        }

        return [];
};

const sanitizePayload = (payload) => ({
        panel: payload.panel === "all" ? "all" : payload.panel || "admin",
        category: payload.category || "general",
        title: payload.title || "New activity",
        message: payload.message || "",
        severity: payload.severity || "info",
        metadata: normalizeMetadata(payload.metadata),
        actor: payload.actor
                ? {
                          name: payload.actor.name || "",
                          role: payload.actor.role || "",
                  }
                : null,
        link: payload.link
                ? {
                          href: payload.link.href || "",
                          label: payload.link.label || "View details",
                  }
                : null,
        status: payload.status || "open",
        read: Boolean(payload.read),
        readAt: payload.read
                ? payload.readAt
                        ? new Date(payload.readAt)
                        : new Date()
                : null,
});

export async function GET(request) {
        const { searchParams } = new URL(request.url);
        const panel = searchParams.get("panel");
        const unreadOnly = searchParams.get("unreadOnly");
        const limit = Number.parseInt(searchParams.get("limit") || "0", 10);
        const status = searchParams.get("status");

        await dbConnect();

        const query = {};

        if (panel && panel !== "all") {
                query.panel = panel;
        }

        if (status) {
                query.status = status;
        }

        if (unreadOnly === "true") {
                query.read = false;
        }

        const notificationsQuery = Notification.find(query).sort({ createdAt: -1 });

        if (limit > 0) {
                notificationsQuery.limit(limit);
        }

        const notifications = await notificationsQuery.lean();

        return NextResponse.json({ notifications });
}

export async function POST(request) {
        const payload = await request.json();
        const clientId = payload.clientId || null;

        await dbConnect();

        const sanitized = sanitizePayload(payload);

        try {
                const notification = await Notification.create(sanitized);
                return NextResponse.json(
                        {
                                notification,
                                clientId,
                        },
                        { status: 201 }
                );
        } catch (error) {
                console.error("Notification creation error", error);
                return NextResponse.json(
                        {
                                message: "Failed to create notification",
                        },
                        { status: 500 }
                );
        }
}
