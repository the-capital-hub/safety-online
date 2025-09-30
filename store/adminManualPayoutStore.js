import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const initialFilters = {
        status: "all",
        search: "",
        startDate: "",
        endDate: "",
        page: 1,
        limit: 10,
};

export const useAdminManualPayoutStore = create(
        devtools(
                persist(
                        (set, get) => ({
                                sellers: [],
                                loading: false,
                                updating: false,
                                error: null,
                                stats: {
                                        totalSellers: 0,
                                        pendingAmount: 0,
                                        scheduledAmount: 0,
                                        paidAmount: 0,
                                },
                                pagination: {
                                        currentPage: 1,
                                        totalPages: 1,
                                        totalRecords: 0,
                                        hasNext: false,
                                        hasPrev: false,
                                },
                                filters: initialFilters,
                                selectedSellerIds: [],
                                setFilters: (filters) =>
                                        set((state) => ({
                                                filters: { ...state.filters, ...filters },
                                        })),
                                resetFilters: () =>
                                        set({
                                                filters: { ...initialFilters },
                                        }),
                                fetchSellers: async () => {
                                        const { filters } = get();
                                        set({ loading: true, error: null });

                                        try {
                                                const params = new URLSearchParams();

                                                Object.entries(filters).forEach(([key, value]) => {
                                                        if (value && value !== "all") {
                                                                params.append(key, value);
                                                        }
                                                });

                                                const response = await fetch(
                                                        `/api/admin/manual-payouts?${params.toString()}`,
                                                        {
                                                                method: "GET",
                                                                credentials: "include",
                                                        }
                                                );

                                                if (!response.ok) {
                                                        const errorResult = await response.json().catch(() => ({}));
                                                        throw new Error(
                                                                errorResult.message || "Failed to fetch manual payouts"
                                                        );
                                                }

                                                const data = await response.json();

                                                if (!data.success) {
                                                        throw new Error(data.message || "Failed to fetch manual payouts");
                                                }

                                                set({
                                                        sellers: data.sellers,
                                                        stats: data.stats,
                                                        pagination: data.pagination,
                                                        loading: false,
                                                });
                                        } catch (error) {
                                                set({
                                                        loading: false,
                                                        error: error.message || "Failed to fetch manual payouts",
                                                });
                                        }
                                },
                                toggleSellerSelection: (sellerId, checked) =>
                                        set((state) => {
                                                const current = new Set(state.selectedSellerIds);

                                                if (checked === true || (!current.has(sellerId) && checked !== false)) {
                                                        current.add(sellerId);
                                                } else {
                                                        current.delete(sellerId);
                                                }

                                                return { selectedSellerIds: Array.from(current) };
                                        }),
                                selectAllOnPage: () =>
                                        set((state) => {
                                                const selected = new Set(state.selectedSellerIds);
                                                state.sellers.forEach((seller) => {
                                                        if (seller.sellerId) {
                                                                selected.add(seller.sellerId);
                                                        }
                                                });
                                                return { selectedSellerIds: Array.from(selected) };
                                        }),
                                clearSelection: () => set({ selectedSellerIds: [] }),
                                downloadCsv: async () => {
                                        const { filters } = get();

                                        const params = new URLSearchParams();
                                        Object.entries(filters).forEach(([key, value]) => {
                                                if (value && value !== "all") {
                                                        params.append(key, value);
                                                }
                                        });
                                        params.append("export", "csv");

                                        const response = await fetch(
                                                `/api/admin/manual-payouts?${params.toString()}`,
                                                {
                                                        method: "GET",
                                                        credentials: "include",
                                                }
                                        );

                                        if (!response.ok) {
                                                const errorText = await response.text();
                                                throw new Error(errorText || "Failed to download manual payouts");
                                        }

                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const anchor = document.createElement("a");
                                        anchor.href = url;
                                        anchor.download = `manual-payouts-${new Date()
                                                .toISOString()
                                                .slice(0, 10)}.csv`;
                                        anchor.style.display = "none";
                                        document.body.appendChild(anchor);
                                        anchor.click();
                                        anchor.remove();
                                        window.URL.revokeObjectURL(url);
                                },
                                bulkUpdateStatus: async ({
                                        sellerIds,
                                        status,
                                        paymentDate,
                                        reference,
                                        amount,
                                        notes,
                                }) => {
                                        if (!Array.isArray(sellerIds) || sellerIds.length === 0) {
                                                throw new Error("Select at least one seller to update");
                                        }

                                        set({ updating: true });
                                        try {
                                                const payload = {
                                                        updates: sellerIds.map((sellerId) => ({
                                                                sellerId,
                                                                status,
                                                                paymentDate,
                                                                reference,
                                                                amount,
                                                                notes,
                                                        })),
                                                };

                                                const response = await fetch("/api/admin/manual-payouts", {
                                                        method: "PATCH",
                                                        credentials: "include",
                                                        headers: {
                                                                "Content-Type": "application/json",
                                                        },
                                                        body: JSON.stringify(payload),
                                                });

                                                const data = await response.json().catch(() => ({ success: false }));

                                                if (!response.ok || !data.success) {
                                                        throw new Error(
                                                                data.message || "Failed to update manual payouts"
                                                        );
                                                }

                                                set({ updating: false, selectedSellerIds: [] });
                                                await get().fetchSellers();
                                                return data;
                                        } catch (error) {
                                                set({ updating: false });
                                                throw error;
                                        }
                                },
                        }),
                        {
                                name: "admin-manual-payout-store",
                                partialize: (state) => ({
                                        filters: state.filters,
                                }),
                        }
                )
        )
);
