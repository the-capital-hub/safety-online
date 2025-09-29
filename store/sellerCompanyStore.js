import { create } from "zustand";
import { devtools } from "zustand/middleware";

const initialState = {
        company: null,
        loading: false,
        saving: false,
        addressesSaving: false,
        uploadingLogo: false,
        initialized: false,
        error: null,
};

export const useSellerCompanyStore = create(
        devtools(
                (set, get) => ({
                        ...initialState,
                        fetchCompany: async (force = false) => {
                                const state = get();
                                if (state.loading) return state.company;
                                if (state.initialized && !force) return state.company;

                                set((s) => ({
                                        ...s,
                                        loading: true,
                                        error: null,
                                        ...(force ? { initialized: false } : {}),
                                }));

                                try {
                                        const res = await fetch("/api/seller/company/getCompany", {
                                                credentials: "include",
                                        });
                                        if (res.status === 404) {
                                                set((s) => ({
                                                        ...s,
                                                        company: null,
                                                        loading: false,
                                                        initialized: true,
                                                }));
                                                return null;
                                        }

                                        if (res.status === 401) {
                                                const message = "You must be logged in to manage your company details.";
                                                set((s) => ({
                                                        ...s,
                                                        company: null,
                                                        loading: false,
                                                        initialized: true,
                                                        error: message,
                                                }));
                                                return null;
                                        }

                                        if (!res.ok) {
                                                const data = await res.json().catch(() => ({}));
                                                throw new Error(data?.error || "Failed to fetch company details");
                                        }

                                        const data = await res.json();

                                        set((s) => ({
                                                ...s,
                                                company: data.company || null,
                                                loading: false,
                                                initialized: true,
                                        }));

                                        return data.company;
                                } catch (error) {
                                        set((s) => ({
                                                ...s,
                                                loading: false,
                                                initialized: true,
                                                error: error.message || "Failed to load company details",
                                        }));
                                        return null;
                                }
                        },
                        saveCompany: async (payload) => {
                                const hasCompany = Boolean(get().company?._id);
                                set((s) => ({ ...s, saving: true, error: null }));

                                try {
                                        const endpoint = hasCompany
                                                ? "/api/seller/company/updateCompany"
                                                : "/api/seller/company/createCompany";
                                        const method = hasCompany ? "PUT" : "POST";

                                        const res = await fetch(endpoint, {
                                                method,
                                                headers: { "Content-Type": "application/json" },
                                                credentials: "include",
                                                body: JSON.stringify(payload),
                                        });
                                        const data = await res.json().catch(() => ({}));

                                        if (!res.ok) {
                                                throw new Error(data?.error || "Failed to save company");
                                        }

                                        set((s) => ({
                                                ...s,
                                                company: data.company || s.company,
                                                saving: false,
                                                initialized: true,
                                        }));

                                        return {
                                                success: true,
                                                message:
                                                        data?.message ||
                                                        (hasCompany ? "Company updated successfully" : "Company created successfully"),
                                                company: data.company,
                                        };
                                } catch (error) {
                                        set((s) => ({
                                                ...s,
                                                saving: false,
                                                error: error.message || "Failed to save company",
                                        }));
                                        return { success: false, message: error.message };
                                }
                        },
                        uploadLogo: async (file) => {
                                set((s) => ({ ...s, uploadingLogo: true, error: null }));
                                try {
                                        const fd = new FormData();
                                        fd.append("file", file);
                                        const res = await fetch("/api/seller/company/upload-logo", {
                                                method: "POST",
                                                body: fd,
                                                credentials: "include",
                                        });
                                        const data = await res.json().catch(() => ({}));

                                        if (!res.ok || !data?.url) {
                                                throw new Error(data?.error || "Upload failed");
                                        }

                                        set((s) => ({
                                                ...s,
                                                uploadingLogo: false,
                                                company: s.company
                                                        ? { ...s.company, companyLogo: data.url }
                                                        : s.company,
                                        }));

                                        return { success: true, url: data.url };
                                } catch (error) {
                                        set((s) => ({
                                                ...s,
                                                uploadingLogo: false,
                                                error: error.message || "Failed to upload logo",
                                        }));
                                        return { success: false, message: error.message };
                                }
                        },
                        updateAddresses: async (addresses) => {
                                set((s) => ({ ...s, addressesSaving: true, error: null }));
                                try {
                                        const res = await fetch("/api/seller/company/updateCompany", {
                                                method: "PUT",
                                                headers: { "Content-Type": "application/json" },
                                                credentials: "include",
                                                body: JSON.stringify({ companyAddress: addresses }),
                                        });
                                        const data = await res.json().catch(() => ({}));
                                        if (!res.ok) {
                                                throw new Error(data?.error || "Failed to update addresses");
                                        }

                                        set((s) => ({
                                                ...s,
                                                addressesSaving: false,
                                                company: data.company || s.company,
                                        }));

                                        return {
                                                success: true,
                                                message: data?.message || "Addresses updated successfully",
                                                company: data.company,
                                        };
                                } catch (error) {
                                        set((s) => ({
                                                ...s,
                                                addressesSaving: false,
                                                error: error.message || "Failed to update addresses",
                                        }));
                                        return { success: false, message: error.message };
                                }
                        },
                        setCompany: (updater) => {
                                set((state) => ({
                                        ...state,
                                        company:
                                                typeof updater === "function"
                                                        ? updater(state.company)
                                                        : updater,
                                }));
                        },
                        clearError: () => set((s) => ({ ...s, error: null })),
                        reset: () => set({ ...initialState }),
                }),
                { name: "seller-company-store" }
        )
);

