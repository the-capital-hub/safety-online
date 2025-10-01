"use client";

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

const normalizeNotification = (notification) => {
        if (!notification) {
                return null;
        }

        const normalized = {
                id: notification._id || notification.id || createNotificationId(),
                panel: notification.panel || "admin",
                category: notification.category || "general",
                title: notification.title || "New activity",
                message: notification.message || "",
                createdAt: notification.createdAt
                        ? new Date(notification.createdAt).toISOString()
                        : new Date().toISOString(),
                read: Boolean(notification.read),
                readAt: notification.readAt ? new Date(notification.readAt).toISOString() : null,
                severity: notification.severity || "info",
                metadata: normalizeMetadata(notification.metadata),
                actor: notification.actor
                        ? {
                                  name: notification.actor.name || "",
                                  role: notification.actor.role || "",
                          }
                        : null,
                link: notification.link
                        ? {
                                  href: notification.link.href || "",
                                  label: notification.link.label || "View details",
                          }
                        : null,
                status: notification.status || "open",
        };

        if (notification.clientId) {
                normalized.clientId = notification.clientId;
        }

        return normalized;
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
                                notifications: [],
                                unreadCounts: { all: 0, admin: 0, seller: 0, buyer: 0 },
                                filters: { panel: "all", severity: "all" },
                                lastViewedAt: null,
                                loading: false,
                                error: null,
                                hasHydrated: false,
                                lastFetchedAt: null,

                                fetchNotifications: async ({ force = false } = {}) => {
                                        const { loading, hasHydrated } = get();

                                        if (loading || (!force && hasHydrated)) {
                                                return;
                                        }

                                        set({ loading: true, error: null });

                                        try {
                                                const response = await fetch("/api/notifications", {
                                                        headers: { "Content-Type": "application/json" },
                                                        cache: "no-store",
                                                });

                                                if (!response.ok) {
                                                        throw new Error("Failed to load notifications");
                                                }

                                                const data = await response.json();
                                                const normalizedNotifications = Array.isArray(data.notifications)
                                                        ? data.notifications
                                                                  .map((notification) => normalizeNotification(notification))
                                                                  .filter(Boolean)
                                                                  .sort(
                                                                          (a, b) =>
                                                                                  new Date(b.createdAt).getTime() -
                                                                                  new Date(a.createdAt).getTime()
                                                                  )
                                                        : [];

                                                set({
                                                        notifications: normalizedNotifications,
                                                        unreadCounts: computeUnreadCounts(normalizedNotifications),
                                                        loading: false,
                                                        error: null,
                                                        hasHydrated: true,
                                                        lastFetchedAt: new Date().toISOString(),
                                                });
                                        } catch (error) {
                                                console.error("Notification fetch error", error);
                                                set({
                                                        loading: false,
                                                        error: error?.message || "Unable to load notifications",
                                                        hasHydrated: true,
                                                });
                                        }
                                },

                                logEvent: async (event) => {
                                        const clientId = createNotificationId();
                                        const normalizedEvent = normalizeNotification({ ...event, id: clientId });

                                        set((state) => {
                                                const notifications = [
                                                        normalizedEvent,
                                                        ...state.notifications.filter(
                                                                (notification) => notification.id !== normalizedEvent.id
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

                                        try {
                                                const response = await fetch("/api/notifications", {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({ ...event, clientId }),
                                                });

                                                if (!response.ok) {
                                                        throw new Error("Failed to persist notification");
                                                }

                                                const data = await response.json();
                                                const serverNotification = normalizeNotification({
                                                        ...data.notification,
                                                        clientId: data.clientId,
                                                });

                                                if (!serverNotification) {
                                                        return normalizedEvent;
                                                }

                                                set((state) => {
                                                        const notifications = state.notifications
                                                                .map((notification) =>
                                                                        notification.id === clientId ||
                                                                        notification.clientId === data.clientId
                                                                                ? serverNotification
                                                                                : notification
                                                                )
                                                                .sort(
                                                                        (a, b) =>
                                                                                new Date(b.createdAt).getTime() -
                                                                                new Date(a.createdAt).getTime()
                                                                );

                                                        return {
                                                                notifications,
                                                                unreadCounts: computeUnreadCounts(notifications),
                                                        };
                                                });
                                        } catch (error) {
                                                console.error("Notification persistence error", error);
                                        }

                                        return normalizedEvent;
                                },

                                markAsRead: async (id) => {
                                        const previousState = get().notifications;

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

                                        try {
                                                await fetch(`/api/notifications/${id}`, {
                                                        method: "PATCH",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({ read: true }),
                                                });
                                        } catch (error) {
                                                console.error(`Failed to mark notification ${id} as read`, error);
                                                set({
                                                        notifications: previousState,
                                                        unreadCounts: computeUnreadCounts(previousState),
                                                });
                                        }
                                },

                                markAsUnread: async (id) => {
                                        const previousState = get().notifications;

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

                                        try {
                                                await fetch(`/api/notifications/${id}`, {
                                                        method: "PATCH",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({ read: false }),
                                                });
                                        } catch (error) {
                                                console.error(`Failed to mark notification ${id} as unread`, error);
                                                set({
                                                        notifications: previousState,
                                                        unreadCounts: computeUnreadCounts(previousState),
                                                });
                                        }
                                },

                                markAllAsRead: async () => {
                                        const previousState = get().notifications;
                                        const unreadNotifications = previousState.filter(
                                                (notification) => !notification.read
                                        );

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

                                        try {
                                                await Promise.all(
                                                        unreadNotifications.map((notification) =>
                                                                fetch(`/api/notifications/${notification.id}`, {
                                                                        method: "PATCH",
                                                                        headers: { "Content-Type": "application/json" },
                                                                        body: JSON.stringify({ read: true }),
                                                                })
                                                        )
                                                );
                                        } catch (error) {
                                                console.error("Failed to mark all notifications as read", error);
                                                set({
                                                        notifications: previousState,
                                                        unreadCounts: computeUnreadCounts(previousState),
                                                });
                                        }
                                },

                                markPanelAsRead: async (panel) => {
                                        if (!panel || panel === "all") {
                                                await get().markAllAsRead();
                                                return;
                                        }

                                        const previousState = get().notifications;
                                        const targetedNotifications = previousState.filter(
                                                (notification) => notification.panel === panel && !notification.read
                                        );

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

                                        try {
                                                await Promise.all(
                                                        targetedNotifications.map((notification) =>
                                                                fetch(`/api/notifications/${notification.id}`, {
                                                                        method: "PATCH",
                                                                        headers: { "Content-Type": "application/json" },
                                                                        body: JSON.stringify({ read: true }),
                                                                })
                                                        )
                                                );
                                        } catch (error) {
                                                console.error(
                                                        `Failed to mark notifications for panel ${panel} as read`,
                                                        error
                                                );
                                                set({
                                                        notifications: previousState,
                                                        unreadCounts: computeUnreadCounts(previousState),
                                                });
                                        }
                                },

                                dismissNotification: async (id) => {
                                        const previousState = get().notifications;

                                        set((state) => {
                                                const notifications = state.notifications.filter(
                                                        (notification) => notification.id !== id
                                                );

                                                return {
                                                        notifications,
                                                        unreadCounts: computeUnreadCounts(notifications),
                                                };
                                        });

                                        try {
                                                await fetch(`/api/notifications/${id}`, {
                                                        method: "DELETE",
                                                });
                                        } catch (error) {
                                                console.error(`Failed to dismiss notification ${id}`, error);
                                                set({
                                                        notifications: previousState,
                                                        unreadCounts: computeUnreadCounts(previousState),
                                                });
                                        }
                                },

                                setFilters: (filters) =>
                                        set((state) => ({
                                                filters: { ...state.filters, ...filters },
                                        })),

                                clearNotifications: async () => {
                                        const previousState = get().notifications;

                                        set({
                                                notifications: [],
                                                unreadCounts: { all: 0, admin: 0, seller: 0, buyer: 0 },
                                        });

                                        try {
                                                await Promise.all(
                                                        previousState.map((notification) =>
                                                                fetch(`/api/notifications/${notification.id}`, {
                                                                        method: "DELETE",
                                                                })
                                                        )
                                                );
                                        } catch (error) {
                                                console.error("Failed to clear notifications", error);
                                                set({
                                                        notifications: previousState,
                                                        unreadCounts: computeUnreadCounts(previousState),
                                                });
                                        }
                                },

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
                                        hasHydrated: state.hasHydrated,
                                        lastFetchedAt: state.lastFetchedAt,
                                }),
                        }
                )
        )
);

export const useUnreadNotifications = (panel = "all") =>
        useNotificationStore((state) => state.unreadCounts[panel] || 0);

export const useNotifications = () =>
        useNotificationStore((state) => state.notifications);
