import { create } from "zustand";
import { toast } from "sonner";

export const useAdminSellerStore = create((set, get) => ({
	sellers: [],
	loading: false,
	error: null,
	pagination: {
		page: 1,
		limit: 10,
		total: 0,
		pages: 0,
	},
	filters: {
		search: "",
		status: "",
	},

	// Fetch sellers
	fetchSellers: async (params = {}) => {
		set({ loading: true, error: null });
		try {
			const { page = 1, limit = 10, search = "", status = "" } = params;

			const queryParams = new URLSearchParams({
				page: page.toString(),
				limit: limit.toString(),
				...(search && { search }),
				...(status && { status }),
			});

			const response = await fetch(`/api/admin/sellers?${queryParams}`);
			const data = await response.json();

			if (data.success) {
				set({
					sellers: data.data,
					pagination: data.pagination,
					filters: { search, status },
					loading: false,
				});
			} else {
				throw new Error(data.error);
			}
		} catch (error) {
			set({ error: error.message, loading: false });
			toast.error("Failed to fetch sellers");
		}
	},

	// Add seller
	addSeller: async (sellerData) => {
		set({ loading: true, error: null });
		try {
			const response = await fetch("/api/admin/sellers", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(sellerData),
			});

			const data = await response.json();

			if (data.success) {
				// Refresh sellers list
				await get().fetchSellers(get().filters);
				toast.success("Seller added successfully");
				set({ loading: false });
				return true;
			} else {
				throw new Error(data.error);
			}
		} catch (error) {
			set({ error: error.message, loading: false });
			toast.error(error.message);
			return false;
		}
	},

	// Update seller
	updateSeller: async (sellerId, sellerData) => {
		set({ loading: true, error: null });
		try {
			const response = await fetch(`/api/admin/sellers/${sellerId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(sellerData),
			});

			const data = await response.json();

			if (data.success) {
				// Update seller in local state
				set((state) => ({
					sellers: state.sellers.map((seller) =>
						seller._id === sellerId ? data.data : seller
					),
					loading: false,
				}));
				toast.success("Seller updated successfully");
				return true;
			} else {
				throw new Error(data.error);
			}
		} catch (error) {
			set({ error: error.message, loading: false });
			toast.error(error.message);
			return false;
		}
	},

	// Delete seller
	deleteSeller: async (sellerId) => {
		set({ loading: true, error: null });
		try {
			const response = await fetch(`/api/admin/sellers/${sellerId}`, {
				method: "DELETE",
			});

			const data = await response.json();

			if (data.success) {
				// Remove seller from local state
				set((state) => ({
					sellers: state.sellers.filter((seller) => seller._id !== sellerId),
					loading: false,
				}));
				toast.success("Seller deleted successfully");
				return true;
			} else {
				throw new Error(data.error);
			}
		} catch (error) {
			set({ error: error.message, loading: false });
			toast.error(error.message);
			return false;
		}
	},

	// Bulk delete sellers
	bulkDeleteSellers: async (sellerIds) => {
		set({ loading: true, error: null });
		try {
			const deletePromises = sellerIds.map((id) =>
				fetch(`/api/admin/sellers/${id}`, { method: "DELETE" })
			);

			await Promise.all(deletePromises);

			// Remove sellers from local state
			set((state) => ({
				sellers: state.sellers.filter(
					(seller) => !sellerIds.includes(seller._id)
				),
				loading: false,
			}));

			toast.success(`${sellerIds.length} sellers deleted successfully`);
			return true;
		} catch (error) {
			set({ error: error.message, loading: false });
			toast.error("Failed to delete sellers");
			return false;
		}
	},

	// Set filters
	setFilters: (filters) => {
		set((state) => ({
			filters: { ...state.filters, ...filters },
		}));
	},

	// Reset filters
	resetFilters: () => {
		set({
			filters: { search: "", status: "" },
		});
	},
}));
