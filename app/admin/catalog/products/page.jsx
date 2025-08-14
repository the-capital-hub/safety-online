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
	Eye,
	Edit,
	Trash2,
	Upload,
	Download,
	FileText,
	ChevronLeft,
	ChevronRight,
	ArrowUpDown,
} from "lucide-react";
import { useAdminProductStore } from "@/store/adminProductStore.js";
import { DeletePopup } from "@/components/AdminPanel/Popups/DeleteProductPopup.jsx";
import { AddProductPopup } from "@/components/AdminPanel/Popups/AddProductPopup.jsx";
import { UpdateProductPopup } from "@/components/AdminPanel/Popups/UpdateProductPopup.jsx";
import { BulkUploadPopup } from "@/components/AdminPanel/Popups/BulkProductUploadPopup.jsx";

const categories = [
	{ value: "all", label: "All Categories" },
	{ value: "personal-safety", label: "Personal Safety" },
	{ value: "road-safety", label: "Road Safety" },
	{ value: "signage", label: "Signage" },
	{ value: "industrial-safety", label: "Industrial Safety" },
	{ value: "queue-management", label: "Queue Management" },
	{ value: "fire-safety", label: "Fire Safety" },
	{ value: "first-aid", label: "First Aid" },
	{ value: "water-safety", label: "Water Safety" },
	{ value: "emergency-kit", label: "Emergency Kit" },
];

export default function AdminProductsPage() {
	const {
		products,
		isLoading,
		error,
		filters,
		pagination,
		selectedProducts,
		fetchProducts,
		setFilters,
		resetFilters,
		setPage,
		setSorting,
		selectAllProducts,
		clearSelection,
		toggleProductSelection,
		deleteProduct,
		deleteMultipleProducts,
		updateProduct,
	} = useAdminProductStore();

	const [popups, setPopups] = useState({
		delete: { open: false, product: null },
		add: false,
		update: { open: false, product: null },
		bulkUpload: false,
	});

	useEffect(() => {
		fetchProducts();
	}, [fetchProducts]);

	const handleSearch = (value) => {
		setFilters({ search: value });
	};

	const handleFilterChange = (key, value) => {
		setFilters({ [key]: value });
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
						Manage your product inventory and details
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
										placeholder="Search products..."
										value={filters.search}
										onChange={(e) => handleSearch(e.target.value)}
										className="pl-10"
									/>
								</div>

								<Select
									value={filters.category}
									onValueChange={(value) =>
										handleFilterChange("category", value)
									}
								>
									<SelectTrigger className="w-48">
										<SelectValue placeholder="Category" />
									</SelectTrigger>
									<SelectContent>
										{categories.map((category) => (
											<SelectItem key={category.value} value={category.value}>
												{category.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								<div className="flex gap-2">
									<Input
										placeholder="Min Price"
										value={filters.minPrice}
										onChange={(e) =>
											handleFilterChange("minPrice", e.target.value)
										}
										className="w-24"
										type="number"
									/>
									<Input
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
											<TableHead>Status</TableHead>
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
													<div className="flex items-center gap-3">
														<div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
															{product.images?.[0] ? (
																<img
																	src={product.images[0] || "https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png"}
																	alt={product.title}
																	className="w-full h-full object-cover rounded-lg"
																/>
															) : (
																<div className="text-xs text-gray-400">IMG</div>
															)}
														</div>
														<div>
															<div className="font-medium">{product.title}</div>
															<div className="text-sm text-gray-500 line-clamp-1">
																{product.description}
															</div>
														</div>
													</div>
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
												<TableCell>
													<Badge
														className={
															product.inStock
																? "bg-green-100 text-green-800 hover:bg-green-200"
																: "bg-red-100 text-red-800 hover:bg-red-200"
														}
													>
														{product.inStock ? "In Stock" : "Out of Stock"}
													</Badge>
												</TableCell>
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
														{/* <Button size="icon" variant="outline">
															<Eye className="w-4 h-4" />
														</Button> */}
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
			<DeletePopup
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
