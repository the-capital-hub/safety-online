import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useNotificationStore } from "@/store/notificationStore.js";

export const useAdminReturnStore = create(
        devtools((set, get) => ({
                requests: [],
                loading: false,
                error: null,
                updatingRequestId: null,
                returnSettings: {
                        enabled: true,
                        windowDays: 7,
                },
                settingsLoading: false,
                settingsError: null,
                updatingSettings: false,

                fetchReturnRequests: async () => {
                        set({ loading: true, error: null });

                        try {
                                const response = await fetch("/api/admin/returns");
                                const data = await response.json();

                                if (!response.ok || !data.success) {
                                        throw new Error(data.message || "Failed to load return requests");
                                }

                                set({ requests: data.requests || [], loading: false });
                        } catch (error) {
                                console.error("Fetch return requests error:", error);
                                set({
                                        loading: false,
                                        error: error.message || "Failed to load return requests",
                                });
                        }
                },

                updateReturnStatus: async (id, payload) => {
                        set({ updatingRequestId: id, error: null });

                        try {
                                const response = await fetch(`/api/admin/returns/${id}`, {
                                        method: "PATCH",
                                        headers: {
                                                "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify(payload),
                                });

                                const data = await response.json();

                                if (!response.ok || !data.success) {
                                        throw new Error(data.message || "Failed to update return request");
                                }

                                set((state) => ({
                                        updatingRequestId: null,
                                        requests: state.requests.map((request) =>
                                                request._id?.toString() === id.toString()
                                                        ? data.request
                                                        : request
                                        ),
                                }));

                                const status = data.request?.status || payload.status;
                                const { logEvent } = useNotificationStore.getState();
                                logEvent({
                                        panel: "admin",
                                        severity:
                                                status === "approved"
                                                        ? "success"
                                                        : status === "rejected"
                                                        ? "critical"
                                                        : "info",
                                        category: "returns",
                                        title: `Return ${status || "updated"}`,
                                        message: `Admin ${status || "updated"} return request ${
                                                data.request?.orderNumber || id
                                        }`,
                                        metadata: [
                                                {
                                                        label: "Order",
                                                        value: data.request?.orderNumber || id,
                                                },
                                                status
                                                        ? {
                                                                  label: "Status",
                                                                  value: status,
                                                          }
                                                        : null,
                                                data.request?.customerName
                                                        ? {
                                                                  label: "Buyer",
                                                                  value: data.request.customerName,
                                                          }
                                                        : null,
                                        ].filter(Boolean),
                                        actor: { name: "Admin panel", role: "Admin" },
                                        link: { href: "/admin/returns", label: "Review returns" },
                                });

                                return { success: true, request: data.request };
                        } catch (error) {
                                console.error("Update return request error:", error);
                                set({
                                        updatingRequestId: null,
                                        error: error.message || "Failed to update return request",
                                });
                                return {
                                        success: false,
                                        message: error.message || "Failed to update return request",
                                };
                        }
                },

                fetchReturnSettings: async () => {
                        set({ settingsLoading: true, settingsError: null });

                        try {
                                const response = await fetch("/api/admin/returns/settings");
                                const data = await response.json();

                                if (!response.ok || !data.success) {
                                        throw new Error(data.message || "Failed to load return settings");
                                }

                                set({
                                        settingsLoading: false,
                                        returnSettings: data.settings,
                                });
                        } catch (error) {
                                console.error("Fetch admin return settings error:", error);
                                set({
                                        settingsLoading: false,
                                        settingsError: error.message || "Failed to load return settings",
                                });
                        }
                },

                updateReturnSettings: async (payload) => {
                        set({ updatingSettings: true, settingsError: null });

                        try {
                                const response = await fetch("/api/admin/returns/settings", {
                                        method: "PUT",
                                        headers: {
                                                "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify(payload),
                                });

                                const data = await response.json();

                                if (!response.ok || !data.success) {
                                        throw new Error(data.message || "Failed to update return settings");
                                }

                                set({
                                        updatingSettings: false,
                                        returnSettings: data.settings,
                                });

                                const { logEvent } = useNotificationStore.getState();
                                logEvent({
                                        panel: "admin",
                                        severity: "info",
                                        category: "returns",
                                        title: "Return policy updated",
                                        message: "Admin adjusted buyer return settings.",
                                        metadata: [
                                                payload?.windowDays
                                                        ? {
                                                                  label: "Return window",
                                                                  value: `${payload.windowDays} days`,
                                                          }
                                                        : null,
                                                payload?.enabled !== undefined
                                                        ? {
                                                                  label: "Returns",
                                                                  value: payload.enabled ? "Enabled" : "Disabled",
                                                          }
                                                        : null,
                                        ].filter(Boolean),
                                        actor: { name: "Admin panel", role: "Admin" },
                                        link: { href: "/admin/returns", label: "Review policy" },
                                });

                                return { success: true, settings: data.settings };
                        } catch (error) {
                                console.error("Update admin return settings error:", error);
                                set({
                                        updatingSettings: false,
                                        settingsError: error.message || "Failed to update return settings",
                                });
                                return {
                                        success: false,
                                        message: error.message || "Failed to update return settings",
                                };
                        }
                },
        }))
);
