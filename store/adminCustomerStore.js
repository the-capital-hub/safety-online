import { create } from "zustand";
import { toast } from "sonner";

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
}));
