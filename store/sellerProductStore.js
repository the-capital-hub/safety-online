"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { toast } from "react-hot-toast";

export const useSellerProductStore = create(
	devtools(
		persist(
			(set, get) => ({
				// State
				products: [],
				categories: [],
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
							`/api/seller/product/getAllProducts?${params}`,
							{
								method: "GET",
								headers: { "Content-Type": "application/json" },
								credentials: "include",
							}
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

				// Updated addProduct to handle base64 images correctly
				addProduct: async (productData) => {
					try {
						// Create FormData for file uploads
						const formData = new FormData();

						// Add all text fields
						formData.append("title", productData.title);
						formData.append("description", productData.description);
						formData.append(
							"longDescription",
							productData.longDescription || productData.description
						);
						formData.append("category", productData.category);
						formData.append("price", productData.price.toString());
						formData.append(
							"salePrice",
							(productData.salePrice || 0).toString()
						);
						formData.append("stocks", productData.stocks.toString());
						formData.append("discount", (productData.discount || 0).toString());
						formData.append("type", productData.type);
						formData.append("published", productData.published);

						if (productData.subCategory)
							formData.append("subCategory", productData.subCategory);
						if (productData.hsnCode)
							formData.append("hsnCode", productData.hsnCode);
						if (productData.brand) formData.append("brand", productData.brand);
						if (productData.length)
							formData.append("length", productData.length.toString());
						if (productData.width)
							formData.append("width", productData.width.toString());
						if (productData.height)
							formData.append("height", productData.height.toString());
						if (productData.weight)
							formData.append("weight", productData.weight.toString());
						if (productData.colour)
							formData.append("colour", productData.colour);
						if (productData.material)
							formData.append("material", productData.material);
						if (productData.size) formData.append("size", productData.size);

						// Add features as JSON string
						formData.append(
							"features",
							JSON.stringify(productData.features || [])
						);

						// Handle base64 images - convert them to Blob objects
						if (productData.images && productData.images.length > 0) {
							productData.images.forEach((base64Image, index) => {
								// Convert base64 to blob
								const base64Data = base64Image.split(",")[1]; // Remove data:image/type;base64, prefix
								const mimeType = base64Image
									.split(",")[0]
									.split(":")[1]
									.split(";")[0]; // Extract MIME type

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

						const response = await fetch("/api/seller/product/addProduct", {
							method: "POST",
							body: formData,
							credentials: "include",
						});

						const data = await response.json();

						if (data.success) {
							toast.success("Product added successfully");
							get().fetchProducts(); // Refresh the list
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
						formData.append("title", updateData.title);
						formData.append("description", updateData.description);
						formData.append(
							"longDescription",
							updateData.longDescription || updateData.description
						);
						formData.append("category", updateData.category);
						formData.append("price", updateData.price.toString());
						formData.append(
							"salePrice",
							(updateData.salePrice || 0).toString()
						);
						formData.append("stocks", updateData.stocks.toString());
						formData.append("discount", (updateData.discount || 0).toString());
						formData.append("type", updateData.type);
						formData.append("published", updateData.published);

						if (updateData.subCategory)
							formData.append("subCategory", updateData.subCategory);
						if (updateData.hsnCode)
							formData.append("hsnCode", updateData.hsnCode);
						if (updateData.brand) formData.append("brand", updateData.brand);
						if (updateData.length)
							formData.append("length", updateData.length.toString());
						if (updateData.width)
							formData.append("width", updateData.width.toString());
						if (updateData.height)
							formData.append("height", updateData.height.toString());
						if (updateData.weight)
							formData.append("weight", updateData.weight.toString());
						if (updateData.colour) formData.append("colour", updateData.colour);
						if (updateData.material)
							formData.append("material", updateData.material);
						if (updateData.size) formData.append("size", updateData.size);

						// Add features as JSON string
						formData.append(
							"features",
							JSON.stringify(updateData.features || [])
						);

						// Handle images - convert base64 to blobs
						if (updateData.images && updateData.images.length > 0) {
							updateData.images.forEach((image, index) => {
								// Check if it's a base64 string (new image) or URL (existing image)
								if (typeof image === "string" && image.startsWith("data:")) {
									// New base64 image - convert to blob
									const base64Data = image.split(",")[1];
									const mimeType = image
										.split(",")[0]
										.split(":")[1]
										.split(";")[0];

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
								} else if (
									typeof image === "string" &&
									image.startsWith("http")
								) {
									// Existing image URL - append as text
									formData.append("existingImages", image);
								}
							});
						}

						const response = await fetch("/api/seller/product/updateProduct", {
							method: "PUT",
							body: formData,
							credentials: "include",
						});

						const data = await response.json();

						if (data.success) {
							toast.success("Product updated successfully");
							get().fetchProducts(); // Refresh the list
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

				deleteProduct: async (productId) => {
					try {
						const response = await fetch("/api/seller/product/deleteProduct", {
							method: "DELETE",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({ productId }),
							credentials: "include",
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
						const response = await fetch(
							"/api/seller/product/deleteMultipleProduct",
							{
								method: "DELETE",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({ productIds }),
								credentials: "include",
							}
						);

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
						const response = await fetch(
							"/api/seller/product/bulkUploadProduct",
							{
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({ products }),
								credentials: "include",
							}
						);

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

				// Fetch categories action
				fetchCategories: async () => {
					try {
						const response = await fetch("/api/categories", {
							method: "GET",
							headers: { "Content-Type": "application/json" },
						});
						const data = await response.json();

						if (data.success) {
							set({ categories: data.categories });
						}
					} catch (error) {
						console.error("Failed to fetch categories:", error);
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
						selectedProducts: state.selectedProducts.filter(
							(id) => id !== productId
						),
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
			}),
			{
				name: "seller-product-storage",
				partialize: (state) => ({ seller_products: state.products }),
			}
		)
	)
);
