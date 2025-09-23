import { create } from "zustand";
import { toast } from "react-hot-toast";

export const useAdminCustomerStore = create((set, get) => ({
	customers: [],
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

	// Fetch customers
	fetchCustomers: async (params = {}) => {
		set({ loading: true, error: null });
		try {
			const { page = 1, limit = 10, search = "", status = "" } = params;

			const queryParams = new URLSearchParams({
				page: page.toString(),
				limit: limit.toString(),
				...(search && { search }),
				...(status && { status }),
			});

			const response = await fetch(`/api/admin/customers?${queryParams}`);
			const data = await response.json();

			if (data.success) {
				set({
					customers: data.data,
					pagination: data.pagination,
					filters: { search, status },
					loading: false,
				});
			} else {
				throw new Error(data.error);
			}
		} catch (error) {
			set({ error: error.message, loading: false });
			toast.error("Failed to fetch customers");
		}
	},

	// Add customer
	addCustomer: async (customerData) => {
		set({ loading: true, error: null });
		try {
			const response = await fetch("/api/admin/customers", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(customerData),
			});

			const data = await response.json();

			if (data.success) {
				// Refresh customers list
				await get().fetchCustomers(get().filters);
				toast.success("Customer added successfully");
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

	// Update customer
	updateCustomer: async (customerId, customerData) => {
		set({ loading: true, error: null });
		try {
			const response = await fetch(`/api/admin/customers/${customerId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(customerData),
			});

			const data = await response.json();

			if (data.success) {
				// Update customer in local state
				set((state) => ({
					customers: state.customers.map((customer) =>
						customer._id === customerId ? data.data : customer
					),
					loading: false,
				}));
				toast.success("Customer updated successfully");
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

	// Delete customer
	deleteCustomer: async (customerId) => {
		set({ loading: true, error: null });
		try {
			const response = await fetch(`/api/admin/customers/${customerId}`, {
				method: "DELETE",
			});

			const data = await response.json();

			if (data.success) {
				// Remove customer from local state
				set((state) => ({
					customers: state.customers.filter(
						(customer) => customer._id !== customerId
					),
					loading: false,
				}));
				toast.success("Customer deleted successfully");
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

	// Bulk delete customers
	bulkDeleteCustomers: async (customerIds) => {
		set({ loading: true, error: null });
		try {
			const deletePromises = customerIds.map((id) =>
				fetch(`/api/admin/customers/${id}`, { method: "DELETE" })
			);

			await Promise.all(deletePromises);

			// Remove customers from local state
			set((state) => ({
				customers: state.customers.filter(
					(customer) => !customerIds.includes(customer._id)
				),
				loading: false,
			}));

			toast.success(`${customerIds.length} customers deleted successfully`);
			return true;
		} catch (error) {
			set({ error: error.message, loading: false });
			toast.error("Failed to delete customers");
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
		const { customers } = get();

		if (!customers || customers.length === 0) {
			toast.error("No customers data to export");
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
					"Legacy Address",
				].join(","),
				...customers.map((customer) =>
					[
						customer._id || "",
						`"${customer.firstName || ""}"`,
						`"${customer.lastName || ""}"`,
						`"${customer.email || ""}"`,
						`"${customer.mobile || ""}"`,
						customer.status || "",
						customer.userType || "",
						customer.isVerified ? "Yes" : "No",
						customer.lastLogin
							? new Date(customer.lastLogin).toLocaleDateString()
							: "Never",
						customer.createdAt
							? new Date(customer.createdAt).toLocaleDateString()
							: "",
						customer.updatedAt
							? new Date(customer.updatedAt).toLocaleDateString()
							: "",
						customer.addresses ? customer.addresses.length : 0,
						`"${customer.address || ""}"`,
					].join(",")
				),
			].join("\n");

			const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `customers_${new Date().toISOString().split("T")[0]}.csv`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);

			toast.success("Customers data exported to CSV successfully");
		} catch (error) {
			toast.error("Failed to export customers data to CSV");
			console.error("CSV Export Error:", error);
		}
	},

	exportToJSON: () => {
		const { customers } = get();

		if (!customers || customers.length === 0) {
			toast.error("No customers data to export");
			return;
		}

		try {
			// Clean up the data for export (remove sensitive information)
			const exportData = customers.map((customer) => ({
				id: customer._id,
				firstName: customer.firstName,
				lastName: customer.lastName,
				email: customer.email,
				mobile: customer.mobile,
				status: customer.status,
				userType: customer.userType,
				isVerified: customer.isVerified,
				lastLogin: customer.lastLogin,
				createdAt: customer.createdAt,
				updatedAt: customer.updatedAt,
				profilePic: customer.profilePic,
				legacyAddress: customer.address,
				addresses: customer.addresses || [],
				addressCount: customer.addresses ? customer.addresses.length : 0,
			}));

			const jsonContent = JSON.stringify(
				{
					exportDate: new Date().toISOString(),
					totalCustomers: exportData.length,
					customers: exportData,
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
			a.download = `customers_${new Date().toISOString().split("T")[0]}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);

			toast.success("Customers data exported to JSON successfully");
		} catch (error) {
			toast.error("Failed to export customers data to JSON");
			console.error("JSON Export Error:", error);
		}
	},
}));
