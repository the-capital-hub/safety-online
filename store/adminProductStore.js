"use client";

import { create } from "zustand";
import { toast } from "react-hot-toast";

export const useAdminProductStore = create((set, get) => ({
	// State
	products: [],
	isLoading: false,
	error: null,
	filters: {
		search: "",
		category: "all",
		subCategory: "all",
		minPrice: "",
		maxPrice: "",
		discount: "",
		published: null,
		inStock: null,
	},
	pagination: {
		currentPage: 1,
		totalPages: 1,
		totalProducts: 0,
		limit: 10,
	},
	selectedProducts: [],
	sortBy: "createdAt",
	sortOrder: "desc",

	// Actions
	fetchProducts: async () => {
		set({ isLoading: true, error: null });

		try {
			const { filters, pagination, sortBy, sortOrder } = get();

			const params = new URLSearchParams({
				page: pagination.currentPage.toString(),
				limit: pagination.limit.toString(),
				sort: sortBy,
				order: sortOrder,
			});

			// Add filters to params
			Object.entries(filters).forEach(([key, value]) => {
				if (
					value !== null &&
					value !== undefined &&
					value !== "" &&
					value !== "all"
				) {
					params.append(key, value.toString());
				}
			});

			const response = await fetch(
				`/api/admin/product/getAllProducts?${params}`
			);
			const data = await response.json();

			if (data.success) {
				set({
					products: data.products,
					pagination: data.pagination,
					isLoading: false,
				});
			} else {
				set({ error: data.message, isLoading: false });
			}
		} catch (error) {
			set({
				error: "Failed to fetch products",
				isLoading: false,
			});
		}
	},

	addProduct: async (productData) => {
		try {
			const formData = new FormData();

			formData.append("sellerId", productData.sellerId);

			// Add all text fields
			formData.append("title", productData.title);
			formData.append("description", productData.description);
			formData.append(
				"longDescription",
				productData.longDescription || productData.description
			);
			formData.append("category", productData.category);
			formData.append("price", productData.price.toString());
			formData.append("salePrice", (productData.salePrice || 0).toString());
			formData.append("stocks", productData.stocks.toString());
			formData.append("discount", (productData.discount || 0).toString());
			formData.append("type", productData.type);
			formData.append("published", productData.published);

			formData.append("subCategory", productData.subCategory || "");
			formData.append("hsnCode", productData.hsnCode || "");
			formData.append("brand", productData.brand || "");
			formData.append("colour", productData.colour || "");
			formData.append("material", productData.material || "");
			formData.append("size", productData.size || "");

			if (
				productData.length !== null &&
				productData.length !== undefined &&
				productData.length !== ""
			) {
				formData.append("length", productData.length.toString());
			}
			if (
				productData.width !== null &&
				productData.width !== undefined &&
				productData.width !== ""
			) {
				formData.append("width", productData.width.toString());
			}
			if (
				productData.height !== null &&
				productData.height !== undefined &&
				productData.height !== ""
			) {
				formData.append("height", productData.height.toString());
			}
			if (
				productData.weight !== null &&
				productData.weight !== undefined &&
				productData.weight !== ""
			) {
				formData.append("weight", productData.weight.toString());
			}

			formData.append("features", JSON.stringify(productData.features || []));

			if (productData.images && productData.images.length > 0) {
				productData.images.forEach((base64Image, index) => {
					// Convert base64 to blob
					const base64Data = base64Image.split(",")[1];
					const mimeType = base64Image
						.split(",")[0]
						.split(":")[1]
						.split(";")[0];

					// Convert base64 to binary
					const byteCharacters = atob(base64Data);
					const byteNumbers = new Array(byteCharacters.length);
					for (let i = 0; i < byteCharacters.length; i++) {
						byteNumbers[i] = byteCharacters.charCodeAt(i);
					}
					const byteArray = new Uint8Array(byteNumbers);

					// Create blob and append to FormData
					const blob = new Blob([byteArray], { type: mimeType });
					formData.append(
						"images",
						blob,
						`image_${index}.${mimeType.split("/")[1]}`
					);
				});
			}

			const response = await fetch("/api/admin/product/addProduct", {
				method: "POST",
				body: formData,
			});

			const data = await response.json();

			if (data.success) {
				toast.success("Product added successfully");
				get().fetchProducts();
				return true;
			} else {
				toast.error(data.message);
				return false;
			}
		} catch (error) {
			console.error("Add product error:", error);
			toast.error("Failed to add product");
			return false;
		}
	},

	updateProduct: async (productId, updateData) => {
		try {
			// Create FormData for file uploads (similar to addProduct)
			const formData = new FormData();

			// Add productId
			formData.append("productId", productId);

			// Add all text fields
			formData.append("sellerId", updateData.sellerId);
			formData.append("title", updateData.title);
			formData.append("description", updateData.description);
			formData.append(
				"longDescription",
				updateData.longDescription || updateData.description
			);
			formData.append("category", updateData.category);
			formData.append("price", updateData?.price?.toString());
			formData.append("salePrice", (updateData?.salePrice || 0)?.toString());
			formData.append("stocks", updateData?.stocks?.toString());
			formData.append("discount", (updateData?.discount || 0)?.toString());
			formData.append("type", updateData.type);
			formData.append("published", updateData.published);
			formData.append("subCategory", updateData.subCategory || "");
			formData.append("hsnCode", updateData.hsnCode || "");
			formData.append("brand", updateData.brand || "");
			formData.append("colour", updateData.colour || "");
			formData.append("material", updateData.material || "");
			formData.append("size", updateData.size || "");

			if (
				updateData.length !== null &&
				updateData.length !== undefined &&
				updateData.length !== ""
			) {
				formData.append("length", updateData?.length?.toString());
			}
			if (
				updateData.width !== null &&
				updateData.width !== undefined &&
				updateData.width !== ""
			) {
				formData.append("width", updateData?.width?.toString());
			}
			if (
				updateData.height !== null &&
				updateData.height !== undefined &&
				updateData.height !== ""
			) {
				formData.append("height", updateData?.height?.toString());
			}
			if (
				updateData.weight !== null &&
				updateData.weight !== undefined &&
				updateData.weight !== ""
			) {
				formData.append("weight", updateData?.weight?.toString());
			}

			formData.append("features", JSON.stringify(updateData.features || []));

			// Handle images - convert base64 to blobs
                        if (updateData.images && updateData.images.length > 0) {
                                const imageOrder = [];
                                let newImageCounter = 0;
                                let existingImageCounter = 0;

                                updateData.images.forEach((image, index) => {
                                        // Check if it's a base64 string (new image) or URL (existing image)
                                        if (typeof image === "string" && image.startsWith("data:")) {
                                                // New base64 image - convert to blob
                                                const base64Data = image.split(",")[1];
                                                const mimeType = image.split(",")[0].split(":")[1].split(";")[0];

                                                const byteCharacters = atob(base64Data);
                                                const byteNumbers = new Array(byteCharacters.length);
                                                for (let i = 0; i < byteCharacters.length; i++) {
                                                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                                                }
                                                const byteArray = new Uint8Array(byteNumbers);

                                                const blob = new Blob([byteArray], { type: mimeType });
                                                formData.append(
                                                        "images",
                                                        blob,
                                                        `image_${index}.${mimeType.split("/")[1]}`
                                                );
                                                imageOrder.push({ type: "new", index: newImageCounter });
                                                newImageCounter += 1;
                                        } else if (typeof image === "string" && image) {
                                                // Existing image URL - append as text
                                                formData.append("existingImages", image);
                                                imageOrder.push({
                                                        type: "existing",
                                                        index: existingImageCounter,
                                                });
                                                existingImageCounter += 1;
                                        }
                                });

                                if (imageOrder.length > 0) {
                                        formData.append("imageOrder", JSON.stringify(imageOrder));
                                }
                        }

			const response = await fetch("/api/admin/product/updateProduct", {
				method: "PUT",
				body: formData,
			});

			const data = await response.json();

			if (data.success) {
				toast.success("Product updated successfully");
				get().fetchProducts();
				return true;
			} else {
				toast.error(data.message);
				return false;
			}
		} catch (error) {
			console.error("Update product error:", error);
			toast.error("Failed to update product");
			return false;
		}
	},

	toggleProductPublish: async (productId, published) => {
		try {
			const response = await fetch(
				"/api/admin/product/updateProduct/togglePublish",
				{
					method: "PUT",
					body: (() => {
						const formData = new FormData();
						formData.append("productId", productId);
						formData.append("published", published);
						return formData;
					})(),
				}
			);

			const data = await response.json();

			if (data.success) {
				toast.success(data.message);
				get().fetchProducts();
				return true;
			} else {
				toast.error(data.message);
				return false;
			}
		} catch (error) {
			console.error("Update product error:", error);
			toast.error("Failed to toggle publish product");
			return false;
		}
	},

	deleteProduct: async (productId) => {
		try {
			const response = await fetch("/api/admin/product/deleteProduct", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ productId }),
			});

			const data = await response.json();

			if (data.success) {
				toast.success("Product deleted successfully");
				get().fetchProducts(); // Refresh the list
				return true;
			} else {
				toast.error(data.message);
				return false;
			}
		} catch (error) {
			toast.error("Failed to delete product");
			return false;
		}
	},

	deleteMultipleProducts: async (productIds) => {
		try {
			const response = await fetch("/api/admin/product/deleteMultipleProduct", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ productIds }),
			});

			const data = await response.json();

			if (data.success) {
				toast.success(data.message);
				set({ selectedProducts: [] }); // Clear selection
				get().fetchProducts(); // Refresh the list
				return true;
			} else {
				toast.error(data.message);
				return false;
			}
		} catch (error) {
			toast.error("Failed to delete products");
			return false;
		}
	},

	bulkUploadProducts: async (products) => {
		try {
			const response = await fetch("/api/admin/product/bulkUploadProduct", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ products }),
			});

			const data = await response.json();

			if (data.success) {
				toast.success(data.message);
				get().fetchProducts(); // Refresh the list
				return data.results;
			} else {
				toast.error(data.message);
				return null;
			}
		} catch (error) {
			toast.error("Failed to bulk upload products");
			return null;
		}
	},

	// Filter and pagination actions
	setFilters: (newFilters) => {
		set((state) => ({
			filters: { ...state.filters, ...newFilters },
			pagination: { ...state.pagination, currentPage: 1 },
		}));
	},

	resetFilters: () => {
		set({
			filters: {
				search: "",
				category: "all",
				subCategory: "all",
				minPrice: "",
				maxPrice: "",
				discount: "",
				published: null,
				inStock: null,
			},
			pagination: { ...get().pagination, currentPage: 1 },
		});
		get().fetchProducts();
	},

	setPage: (page) => {
		set((state) => ({
			pagination: { ...state.pagination, currentPage: page },
		}));
		get().fetchProducts();
	},

	setLimit: (limit) => {
		set((state) => ({
			pagination: { ...state.pagination, limit },
		}));
		get().fetchProducts();
	},

	setSorting: (sortBy, order) => {
		set({ sortBy, sortOrder: order });
		get().fetchProducts();
	},

	// Selection actions
	selectProduct: (productId) => {
		set((state) => ({
			selectedProducts: [...state.selectedProducts, productId],
		}));
	},

	deselectProduct: (productId) => {
		set((state) => ({
			selectedProducts: state.selectedProducts.filter((id) => id !== productId),
		}));
	},

	selectAllProducts: () => {
		set((state) => ({
			selectedProducts: state.products.map((product) => product._id),
		}));
	},

	clearSelection: () => {
		set({ selectedProducts: [] });
	},

	toggleProductSelection: (productId) => {
		const { selectedProducts } = get();
		if (selectedProducts.includes(productId)) {
			get().deselectProduct(productId);
		} else {
			get().selectProduct(productId);
		}
	},
}));
