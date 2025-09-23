import { create } from "zustand";
import { toast } from "react-hot-toast";

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

	// Export functionality
	exportToCSV: () => {
		const { sellers } = get();

		if (!sellers || sellers.length === 0) {
			toast.error("No sellers data to export");
			return;
		}

		try {
			const csvContent = [
				[
					"ID",
					"First Name",
					"Last Name",
					"Email",
					"Mobile",
					"Status",
					"User Type",
					"Verified",
					"Last Login",
					"Created At",
					"Updated At",
					"Address Count",
				].join(","),
				...sellers.map((seller) =>
					[
						seller._id || "",
						`"${seller.firstName || ""}"`,
						`"${seller.lastName || ""}"`,
						`"${seller.email || ""}"`,
						`"${seller.mobile || ""}"`,
						seller.status || "",
						seller.userType || "",
						seller.isVerified ? "Yes" : "No",
						seller.lastLogin
							? new Date(seller.lastLogin).toLocaleDateString()
							: "Never",
						seller.createdAt
							? new Date(seller.createdAt).toLocaleDateString()
							: "",
						seller.updatedAt
							? new Date(seller.updatedAt).toLocaleDateString()
							: "",
						seller.addresses ? seller.addresses.length : 0,
					].join(",")
				),
			].join("\n");

			const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `sellers_${new Date().toISOString().split("T")[0]}.csv`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);

			toast.success("Sellers data exported to CSV successfully");
		} catch (error) {
			toast.error("Failed to export sellers data to CSV");
			console.error("CSV Export Error:", error);
		}
	},

	exportToJSON: () => {
		const { sellers } = get();

		if (!sellers || sellers.length === 0) {
			toast.error("No sellers data to export");
			return;
		}

		try {
			// Clean up the data for export (remove sensitive information)
			const exportData = sellers.map((seller) => ({
				id: seller._id,
				firstName: seller.firstName,
				lastName: seller.lastName,
				email: seller.email,
				mobile: seller.mobile,
				status: seller.status,
				userType: seller.userType,
				isVerified: seller.isVerified,
				lastLogin: seller.lastLogin,
				createdAt: seller.createdAt,
				updatedAt: seller.updatedAt,
				profilePic: seller.profilePic,
				addresses: seller.addresses || [],
				addressCount: seller.addresses ? seller.addresses.length : 0,
			}));

			const jsonContent = JSON.stringify(
				{
					exportDate: new Date().toISOString(),
					totalSellers: exportData.length,
					sellers: exportData,
				},
				null,
				2
			);

			const blob = new Blob([jsonContent], {
				type: "application/json;charset=utf-8;",
			});
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `sellers_${new Date().toISOString().split("T")[0]}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);

			toast.success("Sellers data exported to JSON successfully");
		} catch (error) {
			toast.error("Failed to export sellers data to JSON");
			console.error("JSON Export Error:", error);
		}
	},
}));
