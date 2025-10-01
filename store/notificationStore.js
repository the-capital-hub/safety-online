import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const createNotificationId = () =>
        `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const normalizeMetadata = (metadata) => {
        if (!metadata) return [];
        if (Array.isArray(metadata)) {
                return metadata
                        .filter((item) => item && typeof item === "object")
                        .map((item) => ({
                                label: String(item.label ?? ""),
                                value: String(item.value ?? ""),
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
                                value: String(value),
                        }));
        }

        return [];
};

const panelLabels = {
        admin: "Admin",
        seller: "Seller",
        buyer: "Buyer",
};

const severityDefaults = {
        info: {
                badgeVariant: "outline",
        },
        success: {
                badgeVariant: "default",
        },
        warning: {
                badgeVariant: "secondary",
        },
        critical: {
                badgeVariant: "destructive",
        },
};

const seedNotifications = () => {
        const now = Date.now();
        return [
                {
                        id: createNotificationId(),
                        panel: "seller",
                        category: "orders",
                        title: "Seller accepted order SFT-2819",
                        message:
                                "John's Safety Supplies confirmed order SFT-2819 and is preparing it for shipment.",
                        createdAt: new Date(now - 1000 * 60 * 35).toISOString(),
                        read: false,
                        severity: "success",
                        metadata: [
                                { label: "Order", value: "SFT-2819" },
                                { label: "Buyer", value: "Brighton Builders" },
                                { label: "Value", value: "₹42,800" },
                        ],
                        actor: { name: "John's Safety Supplies", role: "Seller" },
                        link: { href: "/admin/orders", label: "Review order" },
                },
                {
                        id: createNotificationId(),
                        panel: "buyer",
                        category: "returns",
                        title: "Return requested for order SFT-2742",
                        message:
                                "Buyer Aditi Sharma reported a size issue for the high-visibility jacket bundle.",
                        createdAt: new Date(now - 1000 * 60 * 90).toISOString(),
                        read: false,
                        severity: "warning",
                        metadata: [
                                { label: "Order", value: "SFT-2742" },
                                { label: "Reason", value: "Incorrect size delivered" },
                                { label: "Buyer", value: "Aditi Sharma" },
                        ],
                        actor: { name: "Aditi Sharma", role: "Buyer" },
                        link: { href: "/admin/returns", label: "Review request" },
                },
                {
                        id: createNotificationId(),
                        panel: "admin",
                        category: "catalog",
                        title: "New product published",
                        message:
                                "Admin Anita Kapoor added 'Fire-Resistant Coverall v2' to the catalog and pushed it live.",
                        createdAt: new Date(now - 1000 * 60 * 140).toISOString(),
                        read: true,
                        severity: "info",
                        metadata: [
                                { label: "SKU", value: "FR-COV-9281" },
                                { label: "Category", value: "Protective Gear" },
                        ],
                        actor: { name: "Anita Kapoor", role: "Admin" },
                        link: { href: "/admin/catalog/products", label: "View in catalog" },
                },
                {
                        id: createNotificationId(),
                        panel: "seller",
                        category: "payments",
                        title: "Payout released",
                        message:
                                "Payment for order SFT-2610 was released to Zenith Safety Gear after delivery confirmation.",
                        createdAt: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
                        read: true,
                        severity: "success",
                        metadata: [
                                { label: "Order", value: "SFT-2610" },
                                { label: "Amount", value: "₹18,540" },
                        ],
                        actor: { name: "System", role: "Payment" },
                        link: { href: "/admin/payments", label: "Open payouts" },
                },
                {
                        id: createNotificationId(),
                        panel: "buyer",
                        category: "orders",
                        title: "High risk payment attempt",
                        message:
                                "Buyer Rahul Singh attempted a COD order that exceeded daily limits and was auto-reviewed.",
                        createdAt: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
                        read: true,
                        severity: "critical",
                        metadata: [
                                { label: "Order", value: "SFT-2598" },
                                { label: "Amount", value: "₹72,300" },
                                { label: "Risk", value: "High" },
                        ],
                        actor: { name: "Risk Engine", role: "System" },
                        link: { href: "/admin/orders", label: "Investigate" },
                },
        ];
};

const computeUnreadCounts = (notifications) => {
        const counts = { all: 0, admin: 0, seller: 0, buyer: 0 };
        notifications.forEach((notification) => {
                if (!notification.read) {
                        counts.all += 1;
                        if (notification.panel && counts[notification.panel] !== undefined) {
                                counts[notification.panel] += 1;
                        }
                }
        });
        return counts;
};

export const useNotificationStore = create(
        devtools(
                persist(
                        (set, get) => ({
                                notifications: seedNotifications().sort(
                                        (a, b) =>
                                                new Date(b.createdAt).getTime() -
                                                new Date(a.createdAt).getTime()
                                ),
                                unreadCounts: computeUnreadCounts(seedNotifications()),
                                filters: { panel: "all", severity: "all" },
                                lastViewedAt: null,

                                logEvent: (event) => {
                                        const normalizedEvent = {
                                                id: event.id || createNotificationId(),
                                                panel: event.panel || "admin",
                                                category: event.category || "general",
                                                title: event.title || "New activity",
                                                message: event.message || "",
                                                createdAt:
                                                        event.createdAt ||
                                                        event.timestamp ||
                                                        new Date().toISOString(),
                                                read: Boolean(event.read) ?? false,
                                                readAt: event.read ? event.readAt || new Date().toISOString() : null,
                                                severity: event.severity || "info",
                                                metadata: normalizeMetadata(event.metadata),
                                                actor: event.actor || null,
                                                link: event.link || null,
                                                status: event.status || "open",
                                        };

                                        set((state) => {
                                                const notifications = [
                                                        normalizedEvent,
                                                        ...state.notifications.filter(
                                                                (notification) =>
                                                                        notification.id !== normalizedEvent.id
                                                        ),
                                                ].sort(
                                                        (a, b) =>
                                                                new Date(b.createdAt).getTime() -
                                                                new Date(a.createdAt).getTime()
                                                );

                                                return {
                                                        notifications,
                                                        unreadCounts: computeUnreadCounts(notifications),
                                                };
                                        });

                                        return normalizedEvent;
                                },

                                markAsRead: (id) => {
                                        set((state) => {
                                                const notifications = state.notifications.map((notification) =>
                                                        notification.id === id
                                                                ? {
                                                                          ...notification,
                                                                          read: true,
                                                                          readAt:
                                                                                  notification.readAt ||
                                                                                  new Date().toISOString(),
                                                                          status:
                                                                                  notification.status === "open"
                                                                                          ? "acknowledged"
                                                                                          : notification.status,
                                                                  }
                                                                : notification
                                                );

                                                return {
                                                        notifications,
                                                        unreadCounts: computeUnreadCounts(notifications),
                                                };
                                        });
                                },

                                markAsUnread: (id) => {
                                        set((state) => {
                                                const notifications = state.notifications.map((notification) =>
                                                        notification.id === id
                                                                ? {
                                                                          ...notification,
                                                                          read: false,
                                                                          status: "open",
                                                                          readAt: null,
                                                                  }
                                                                : notification
                                                );

                                                return {
                                                        notifications,
                                                        unreadCounts: computeUnreadCounts(notifications),
                                                };
                                        });
                                },

                                markAllAsRead: () => {
                                        set((state) => {
                                                const notifications = state.notifications.map((notification) =>
                                                        notification.read
                                                                ? notification
                                                                : {
                                                                          ...notification,
                                                                          read: true,
                                                                          readAt: new Date().toISOString(),
                                                                          status:
                                                                                  notification.status === "open"
                                                                                          ? "acknowledged"
                                                                                          : notification.status,
                                                                  }
                                                );

                                                return {
                                                        notifications,
                                                        unreadCounts: computeUnreadCounts(notifications),
                                                        lastViewedAt: new Date().toISOString(),
                                                };
                                        });
                                },

                                markPanelAsRead: (panel) => {
                                        if (!panel || panel === "all") {
                                                get().markAllAsRead();
                                                return;
                                        }

                                        set((state) => {
                                                const notifications = state.notifications.map((notification) =>
                                                        notification.panel === panel && !notification.read
                                                                ? {
                                                                          ...notification,
                                                                          read: true,
                                                                          readAt: new Date().toISOString(),
                                                                          status:
                                                                                  notification.status === "open"
                                                                                          ? "acknowledged"
                                                                                          : notification.status,
                                                                  }
                                                                : notification
                                                );

                                                return {
                                                        notifications,
                                                        unreadCounts: computeUnreadCounts(notifications),
                                                };
                                        });
                                },

                                dismissNotification: (id) => {
                                        set((state) => {
                                                const notifications = state.notifications.filter(
                                                        (notification) => notification.id !== id
                                                );

                                                return {
                                                        notifications,
                                                        unreadCounts: computeUnreadCounts(notifications),
                                                };
                                        });
                                },

                                setFilters: (filters) =>
                                        set((state) => ({
                                                filters: { ...state.filters, ...filters },
                                        })),

                                clearNotifications: () =>
                                        set({
                                                notifications: [],
                                                unreadCounts: { all: 0, admin: 0, seller: 0, buyer: 0 },
                                        }),

                                getPanelLabel: (panel) => panelLabels[panel] || "General",

                                getSeverityConfig: (severity) =>
                                        severityDefaults[severity] || severityDefaults.info,
                        }),
                        {
                                name: "notification-center",
                                partialize: (state) => ({
                                        notifications: state.notifications,
                                        unreadCounts: state.unreadCounts,
                                        lastViewedAt: state.lastViewedAt,
                                }),
                        }
                )
        )
);

export const useUnreadNotifications = (panel = "all") =>
        useNotificationStore((state) => state.unreadCounts[panel] || 0);

export const useNotifications = () =>
        useNotificationStore((state) => state.notifications);
