"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Search,
	Plus,
	Filter,
	RotateCcw,
	Share2,
	Edit,
	Trash2,
	Upload,
	Download,
	FileText,
	ChevronLeft,
	ChevronRight,
	ArrowUpDown,
} from "lucide-react";

import { useSellerProductStore } from "@/store/sellerProductStore.js";
import { DeleteProductPopup } from "@/components/SellerPanel/Products/DeleteProductPopup.jsx";
import { AddProductPopup } from "@/components/SellerPanel/Products/AddProductPopup.jsx";
import { UpdateProductPopup } from "@/components/SellerPanel/Products/UpdateProductPopup.jsx";
import { BulkUploadPopup } from "@/components/SellerPanel/Products/BulkProductUploadPopup.jsx";
import { toast } from "react-hot-toast";
import { useIsSellerAuthenticated } from "@/store/sellerAuthStore.js";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SellerProductsPage() {
	const {
		products,
		categories,
		isLoading,
		error,
		filters,
		pagination,
		selectedProducts,
		fetchProducts,
		fetchCategories,
		setFilters,
		resetFilters,
		setPage,
		setLimit,
		setSorting,
		selectAllProducts,
		clearSelection,
		toggleProductSelection,
		deleteProduct,
		deleteMultipleProducts,
		updateProduct,
	} = useSellerProductStore();

	const [popups, setPopups] = useState({
		delete: { open: false, product: null },
		add: false,
		update: { open: false, product: null },
		bulkUpload: false,
	});

	const isAuthenticated = useIsSellerAuthenticated();
	const [isRedirecting, setIsRedirecting] = useState(false);
	const router = useRouter();

	useEffect(() => {
		if (!isAuthenticated) {
			setIsRedirecting(true);
			const timer = setTimeout(() => {
				router.push("/seller/login");
			}, 100);

			return () => clearTimeout(timer);
		}
	}, [isAuthenticated, router]);

	useEffect(() => {
		if (isAuthenticated) {
			fetchProducts();
			fetchCategories();
		}
	}, [fetchProducts, fetchCategories, isAuthenticated]);

	const totalCategoryProductCount = categories.reduce(
		(total, category) => total + (Number(category.productCount) || 0),
		0
	);

	const categoryOptions = [
		{
			value: "all",
			label: "All Categories",
			productCount: totalCategoryProductCount,
			subCategories: [],
		},
		...categories.map((category) => ({
			value: category.slug || category.name.toLowerCase().replace(/\s+/g, "-"),
			label: category.name,
			productCount: category.productCount || 0,
			subCategories: category.subCategories || [],
		})),
	];

	const activeCategoryValue = (() => {
		if (!filters.category || filters.category === "all") {
			return "all";
		}

		const match = categoryOptions.find(
			(category) =>
				category.value === filters.category ||
				category.label === filters.category
		);

		return match ? match.value : "all";
	})();

	const selectedCategory =
		activeCategoryValue && activeCategoryValue !== "all"
			? categoryOptions.find(
					(category) => category.value === activeCategoryValue
			  )
			: null;

	const subCategoryOptions = selectedCategory
		? [
				{
					value: "all",
					label: "All Subcategories",
					productCount: (selectedCategory.subCategories || []).reduce(
						(total, subCategory) =>
							total + (Number(subCategory.productCount) || 0),
						0
					),
				},
				...(selectedCategory.subCategories || []).map((subCategory) => ({
					value:
						subCategory.slug ||
						subCategory.name.toLowerCase().replace(/\s+/g, "-"),
					label: subCategory.name,
					productCount: subCategory.productCount || 0,
				})),
		  ]
		: [];

	const activeSubCategoryValue = (() => {
		if (!filters.subCategory || filters.subCategory === "all") {
			return "all";
		}

		const match = subCategoryOptions.find(
			(subCategory) =>
				subCategory.value === filters.subCategory ||
				subCategory.label === filters.subCategory
		);

		return match ? match.value : "all";
	})();

	if (!isAuthenticated) {
		return (
			<div className="flex items-center justify-center py-4 px-6 bg-white">
				<div className="text-gray-600">Redirecting to login...</div>
			</div>
		);
	}

	const handleSearch = (value) => {
		setFilters({ search: value });
	};

	const handleFilterChange = (keyOrObject, value) => {
		if (typeof keyOrObject === "object" && keyOrObject !== null) {
			setFilters(keyOrObject);
			return;
		}

		setFilters({ [keyOrObject]: value });
	};

	const handleApplyFilters = () => {
		fetchProducts();
	};

	const handleSelectAll = (checked) => {
		if (checked) {
			selectAllProducts();
		} else {
			clearSelection();
		}
	};

	const handleDelete = (product) => {
		setPopups((prev) => ({ ...prev, delete: { open: true, product } }));
	};

	const handleUpdate = (product) => {
		setPopups((prev) => ({ ...prev, update: { open: true, product } }));
	};

	const confirmDelete = async () => {
		if (popups.delete.product) {
			await deleteProduct(popups.delete.product._id);
		}
	};

	const handleBulkDelete = async () => {
		if (selectedProducts.length > 0) {
			await deleteMultipleProducts(selectedProducts);
		}
	};

	const handlePublishToggle = async (productId, published) => {
		await updateProduct(productId, { published });
	};

	const handleSort = (field) => {
		const currentOrder = filters.sortOrder === "desc" ? "asc" : "desc";
		setSorting(field, currentOrder);
	};

	const exportToCSV = () => {
		const csvContent = [
			[
				"ID",
				"Name",
				"Category",
				"Price",
				"Sale Price",
				"Stock",
				"Status",
				"Published",
			].join(","),
			...products.map((product) =>
				[
					product._id,
					`"${product.title}"`,
					product.category,
					product.price,
					product.salePrice || product.price,
					product.stocks,
					product.inStock ? "In Stock" : "Out of Stock",
					product.published ? "Yes" : "No",
				].join(",")
			),
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "products.csv";
		a.click();
		window.URL.revokeObjectURL(url);
	};

	const exportToJSON = () => {
		const jsonContent = JSON.stringify(products, null, 2);
		const blob = new Blob([jsonContent], { type: "application/json" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "products.json";
		a.click();
		window.URL.revokeObjectURL(url);
	};

	const handleShare = (product) => {
		const shareLink = `${process.env.NEXT_PUBLIC_BASE_URL}/products/${product._id}`;
		navigator.clipboard.writeText(shareLink);
		toast.success("Link copied to clipboard");
		console.log("Link copied to clipboard:", shareLink);
	};

	// Helper function to get category display name
	const getCategoryDisplayName = (categorySlug) => {
		if (categorySlug === "all") return "All Categories";

		const category = categories.find((cat) => {
			const slug = cat.slug || cat.name?.toLowerCase().replace(/\s+/g, "-");
			return slug === categorySlug;
		});

		return category
			? category.name
			: toSentenceCase(categorySlug.replace(/-/g, " "));
	};

	function toSentenceCase(str) {
		if (!str) return "";

		return str
			.toLowerCase()
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
					<p className="text-gray-600 mb-4">{error}</p>
					<Button onClick={fetchProducts}>Try Again</Button>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="space-y-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					<h1 className="text-3xl font-bold text-gray-900">
						Products Management
					</h1>
					<p className="text-gray-600 mt-1">
						Manage product inventory and details
					</p>
				</motion.div>

				<Card>
					<CardHeader>
						<div className="flex flex-col gap-4">
							{/* Action Buttons Row */}
							<div className="flex flex-wrap gap-4 items-center">
								<Button
									variant="outline"
									className="text-orange-600 border-orange-600 bg-transparent"
									onClick={exportToCSV}
								>
									<Upload className="w-4 h-4 mr-2" />
									Export CSV
								</Button>

								<Button
									variant="outline"
									className="text-green-600 border-green-600 bg-transparent"
									onClick={exportToJSON}
								>
									<Download className="w-4 h-4 mr-2" />
									Export JSON
								</Button>

								<Button
									variant="outline"
									className="text-blue-600 border-blue-600 bg-transparent"
									onClick={() =>
										setPopups((prev) => ({ ...prev, bulkUpload: true }))
									}
								>
									<FileText className="w-4 h-4 mr-2" />
									Bulk Upload
								</Button>

								{selectedProducts.length > 0 && (
									<Button
										variant="destructive"
										onClick={handleBulkDelete}
										className="bg-red-600 hover:bg-red-700"
									>
										<Trash2 className="w-4 h-4 mr-2" />
										Delete Selected ({selectedProducts.length})
									</Button>
								)}

								<Button
									onClick={() => setPopups((prev) => ({ ...prev, add: true }))}
									className="bg-green-600 hover:bg-green-700"
								>
									<Plus className="w-4 h-4 mr-2" />
									Add Product
								</Button>
							</div>

							{/* Search and Filter Row */}
							<div className="flex gap-4 items-center flex-wrap">
								<div className="relative flex-1 max-w-md">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
									<Input
										name="searchQuery"
										placeholder="Search products..."
										value={filters.search}
										onChange={(e) => handleSearch(e.target.value)}
										className="pl-10"
									/>
								</div>

								<Select
									value={activeCategoryValue}
									onValueChange={(value) =>
										handleFilterChange({
											category: value,
											subCategory: "all",
										})
									}
								>
									<SelectTrigger className="w-48">
										<SelectValue placeholder="Category" />
									</SelectTrigger>
									<SelectContent>
										{categoryOptions.map((category) => (
											<SelectItem key={category.value} value={category.value}>
												<div className="flex items-center justify-between w-full">
													<span>{toSentenceCase(category.label)}</span>
													{category.productCount > 0 && (
														<Badge variant="secondary" className="ml-2 text-xs">
															{category.productCount}
														</Badge>
													)}
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								{selectedCategory && subCategoryOptions.length > 0 && (
									<Select
										value={activeSubCategoryValue}
										onValueChange={(value) =>
											handleFilterChange("subCategory", value)
										}
									>
										<SelectTrigger className="w-56">
											<SelectValue placeholder="Subcategory" />
										</SelectTrigger>
										<SelectContent>
											{subCategoryOptions.map((subCategory) => (
												<SelectItem
													key={`${selectedCategory.value}-${subCategory.value}`}
													value={subCategory.value}
												>
													<div className="flex items-center justify-between w-full">
														<span>{toSentenceCase(subCategory.label)}</span>
														{subCategory.productCount > 0 && (
															<Badge
																variant="secondary"
																className="ml-2 text-xs"
															>
																{subCategory.productCount}
															</Badge>
														)}
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}

								<div className="flex gap-2">
									<Input
										name="minPrice"
										placeholder="Min Price"
										value={filters.minPrice}
										onChange={(e) =>
											handleFilterChange("minPrice", e.target.value)
										}
										className="w-24"
										type="number"
									/>
									<Input
										name="maxPrice"
										placeholder="Max Price"
										value={filters.maxPrice}
										onChange={(e) =>
											handleFilterChange("maxPrice", e.target.value)
										}
										className="w-24"
										type="number"
									/>
								</div>

								<Select
									value={filters.published?.toString() || "all"}
									onValueChange={(value) =>
										handleFilterChange(
											"published",
											value === "all" ? null : value === "true"
										)
									}
								>
									<SelectTrigger className="w-32">
										<SelectValue placeholder="Status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Status</SelectItem>
										<SelectItem value="true">Published</SelectItem>
										<SelectItem value="false">Draft</SelectItem>
									</SelectContent>
								</Select>

								<Button
									onClick={handleApplyFilters}
									className="bg-green-600 hover:bg-green-700"
								>
									<Filter className="w-4 h-4 mr-2" />
									Apply
								</Button>

								<Button variant="outline" onClick={resetFilters}>
									<RotateCcw className="w-4 h-4 mr-2" />
									Reset
								</Button>
							</div>
						</div>
					</CardHeader>

					<CardContent>
						{isLoading ? (
							<div className="flex items-center justify-center py-12">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
							</div>
						) : (
							<>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-12">
												<Checkbox
													checked={
														selectedProducts.length === products.length &&
														products.length > 0
													}
													onCheckedChange={handleSelectAll}
												/>
											</TableHead>
											<TableHead>
												<Button
													variant="ghost"
													onClick={() => handleSort("title")}
													className="p-0 h-auto font-medium"
												>
													Product Name
													<ArrowUpDown className="ml-2 h-4 w-4" />
												</Button>
											</TableHead>
											<TableHead>Category</TableHead>
											<TableHead>
												<Button
													variant="ghost"
													onClick={() => handleSort("price")}
													className="p-0 h-auto font-medium"
												>
													Price
													<ArrowUpDown className="ml-2 h-4 w-4" />
												</Button>
											</TableHead>
											<TableHead>Sale Price</TableHead>
											<TableHead>
												<Button
													variant="ghost"
													onClick={() => handleSort("stocks")}
													className="p-0 h-auto font-medium"
												>
													Stock
													<ArrowUpDown className="ml-2 h-4 w-4" />
												</Button>
											</TableHead>
											{/* <TableHead>Status</TableHead> */}
											<TableHead>Published</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{products.map((product, index) => (
											<motion.tr
												key={product._id}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.2, delay: index * 0.05 }}
											>
												<TableCell>
													<Checkbox
														checked={selectedProducts.includes(product._id)}
														onCheckedChange={() =>
															toggleProductSelection(product._id)
														}
													/>
												</TableCell>
												<TableCell className="font-medium">
													<Link
														href={`/products/${product.slug || product._id}`}
														target="_blank"
														rel="noopener noreferrer"
														className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50"
													>
														<div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
															{product.images?.[0] ? (
																<img
																	src={
																		product.images[0] ||
																		"https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png"
																	}
																	alt={product.title}
																	className="w-full h-full object-cover rounded-lg"
																/>
															) : (
																<div className="text-xs text-gray-400">IMG</div>
															)}
														</div>
                                                                                                                <div className="min-w-0">
                                                                                                                        <div className="font-medium max-w-xl break-words group-hover:underline">
                                                                                                                                {product.title}
                                                                                                                        </div>
                                                                                                                </div>
													</Link>
												</TableCell>
												<TableCell>
													<Badge variant="outline" className="capitalize">
														{product.category.replace("-", " ")}
													</Badge>
												</TableCell>
												<TableCell className="font-medium">
													₹{product.price.toLocaleString()}
												</TableCell>
												<TableCell className="font-medium">
													{product.salePrice > 0
														? `₹${product.salePrice.toLocaleString()}`
														: "-"}
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<span>{product.stocks}</span>
														<div
															className={`w-2 h-2 rounded-full ${
																product.inStock ? "bg-green-500" : "bg-red-500"
															}`}
														/>
													</div>
												</TableCell>
												{/* <TableCell>
													<Badge
														className={
															product.inStock
																? "bg-green-100 text-green-800 hover:bg-green-200"
																: "bg-red-100 text-red-800 hover:bg-red-200"
														}
													>
														{product.inStock ? "In Stock" : "Out of Stock"}
													</Badge>
												</TableCell> */}
												<TableCell>
													<Switch
														checked={product.published}
														onCheckedChange={(checked) =>
															handlePublishToggle(product._id, checked)
														}
													/>
												</TableCell>
												<TableCell>
													<div className="flex gap-2">
														<Button
															size="icon"
															variant="outline"
															onClick={() => handleShare(product)}
														>
															<Share2 className="w-4 h-4" />
														</Button>
														<Button
															size="icon"
															variant="outline"
															onClick={() => handleUpdate(product)}
														>
															<Edit className="w-4 h-4" />
														</Button>
														<Button
															size="icon"
															variant="outline"
															className="text-red-600 hover:text-red-700 bg-transparent"
															onClick={() => handleDelete(product)}
														>
															<Trash2 className="w-4 h-4" />
														</Button>
													</div>
												</TableCell>
											</motion.tr>
										))}
									</TableBody>
								</Table>

								{/* Pagination */}
								<div className="flex items-center justify-between mt-6">
									<p className="text-sm text-gray-600">
										Showing{" "}
										{(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
										{Math.min(
											pagination.currentPage * pagination.limit,
											pagination.totalProducts
										)}{" "}
										of {pagination.totalProducts} products
									</p>
									<div className="flex gap-2">
										<Select
											value={pagination.limit.toString()}
											onValueChange={(value) => {
												const newLimit = Number(value);
												setLimit(newLimit);
												setPage(1); // Reset to first page when changing limit
												fetchProducts(); // Refetch with new limit
											}}
										>
											<SelectTrigger className="w-24">
												<SelectValue placeholder="Limit" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="10">10</SelectItem>
												<SelectItem value="25">25</SelectItem>
												<SelectItem value="50">50</SelectItem>
												<SelectItem value="100">100</SelectItem>
											</SelectContent>
										</Select>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setPage(pagination.currentPage - 1)}
											disabled={!pagination.hasPrevPage}
										>
											<ChevronLeft className="w-4 h-4" />
											Previous
										</Button>

										{Array.from(
											{ length: Math.min(5, pagination.totalPages) },
											(_, i) => {
												let pageNum;
												if (pagination.totalPages <= 5) {
													pageNum = i + 1;
												} else if (pagination.currentPage <= 3) {
													pageNum = i + 1;
												} else if (
													pagination.currentPage >=
													pagination.totalPages - 2
												) {
													pageNum = pagination.totalPages - 4 + i;
												} else {
													pageNum = pagination.currentPage - 2 + i;
												}

												return (
													<Button
														key={pageNum}
														size="sm"
														variant={
															pagination.currentPage === pageNum
																? "default"
																: "outline"
														}
														onClick={() => setPage(pageNum)}
														className={
															pagination.currentPage === pageNum
																? "bg-black text-white"
																: ""
														}
													>
														{pageNum}
													</Button>
												);
											}
										)}

										<Button
											variant="outline"
											size="sm"
											onClick={() => setPage(pagination.currentPage + 1)}
											disabled={!pagination.hasNextPage}
										>
											Next
											<ChevronRight className="w-4 h-4" />
										</Button>
									</div>
								</div>
							</>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Popups */}
			<DeleteProductPopup
				open={popups.delete.open}
				onOpenChange={(open) =>
					setPopups((prev) => ({ ...prev, delete: { open, product: null } }))
				}
				itemName={popups.delete.product?.title}
				onConfirm={confirmDelete}
			/>

			<AddProductPopup
				open={popups.add}
				onOpenChange={(open) => setPopups((prev) => ({ ...prev, add: open }))}
			/>

			<UpdateProductPopup
				open={popups.update.open}
				onOpenChange={(open) =>
					setPopups((prev) => ({ ...prev, update: { open, product: null } }))
				}
				product={popups.update.product}
			/>

			<BulkUploadPopup
				open={popups.bulkUpload}
				onOpenChange={(open) =>
					setPopups((prev) => ({ ...prev, bulkUpload: open }))
				}
			/>
		</>
	);
}
