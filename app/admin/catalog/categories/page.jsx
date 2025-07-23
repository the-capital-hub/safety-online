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
	Edit,
	Trash2,
	Upload,
	Download,
	ChevronLeft,
	ChevronRight,
	ArrowUpDown,
	Package,
} from "lucide-react";
import { useAdminCategoryStore } from "@/store/adminCategoryStore.js";
import { DeletePopup } from "@/components/AdminPanel/Popups/DeletePopup.jsx";
import { AddCategoryPopup } from "@/components/AdminPanel/Popups/AddCategoryPopup.jsx";
import { UpdateCategoryPopup } from "@/components/AdminPanel/Popups/UpdateCategoryPopup.jsx";

export default function AdminCategoriesPage() {
	const {
		categories,
		isLoading,
		error,
		filters,
		pagination,
		selectedCategories,
		fetchCategories,
		setFilters,
		resetFilters,
		setPage,
		setSorting,
		selectAllCategories,
		clearSelection,
		toggleCategorySelection,
		deleteCategory,
		deleteMultipleCategories,
		updateCategory,
		exportToCSV,
		exportToJSON,
	} = useAdminCategoryStore();

	const [popups, setPopups] = useState({
		delete: { open: false, category: null },
		add: false,
		update: { open: false, category: null },
	});

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	const handleSearch = (value) => {
		setFilters({ search: value });
	};

	const handleFilterChange = (key, value) => {
		setFilters({ [key]: value });
	};

	const handleApplyFilters = () => {
		fetchCategories();
	};

	const handleSelectAll = (checked) => {
		if (checked) {
			selectAllCategories();
		} else {
			clearSelection();
		}
	};

	const handleDelete = (category) => {
		setPopups((prev) => ({ ...prev, delete: { open: true, category } }));
	};

	const handleUpdate = (category) => {
		setPopups((prev) => ({ ...prev, update: { open: true, category } }));
	};

	const confirmDelete = async () => {
		if (popups.delete.category) {
			await deleteCategory(popups.delete.category._id);
		}
	};

	const handleBulkDelete = async () => {
		if (selectedCategories.length > 0) {
			await deleteMultipleCategories(selectedCategories);
		}
	};

	const handlePublishToggle = async (categoryId, published) => {
		await updateCategory(categoryId, { published });
	};

	const handleSort = (field) => {
		const currentOrder = filters.sortOrder === "desc" ? "asc" : "desc";
		setSorting(field, currentOrder);
	};

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
					<p className="text-gray-600 mb-4">{error}</p>
					<Button onClick={fetchCategories}>Try Again</Button>
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
						Categories Management
					</h1>
					<p className="text-gray-600 mt-1">
						Organize and manage your product categories
					</p>
				</motion.div>

				<Card>
					<CardHeader>
						<div className="flex flex-col gap-4">
							{/* Action Buttons Row */}
							<div className="flex flex-wrap gap-4 items-center justify-between">
								<div className="flex gap-4 items-center">
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

									{selectedCategories.length > 0 && (
										<Button
											variant="destructive"
											onClick={handleBulkDelete}
											className="bg-red-600 hover:bg-red-700"
										>
											<Trash2 className="w-4 h-4 mr-2" />
											Delete Selected ({selectedCategories.length})
										</Button>
									)}
								</div>

								<Button
									onClick={() => setPopups((prev) => ({ ...prev, add: true }))}
									className="bg-green-600 hover:bg-green-700"
								>
									<Plus className="w-4 h-4 mr-2" />
									Add Category
								</Button>
							</div>

							{/* Search and Filter Row */}
							<div className="flex gap-4 items-center flex-wrap">
								<div className="relative flex-1 max-w-md">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
									<Input
										placeholder="Search categories..."
										value={filters.search}
										onChange={(e) => handleSearch(e.target.value)}
										className="pl-10"
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
														selectedCategories.length === categories.length &&
														categories.length > 0
													}
													onCheckedChange={handleSelectAll}
												/>
											</TableHead>
											<TableHead>Icon</TableHead>
											<TableHead>
												<Button
													variant="ghost"
													onClick={() => handleSort("name")}
													className="p-0 h-auto font-medium"
												>
													Name
													<ArrowUpDown className="ml-2 h-4 w-4" />
												</Button>
											</TableHead>
											<TableHead>Description</TableHead>
											<TableHead>Products</TableHead>
											<TableHead>Published</TableHead>
											<TableHead>
												<Button
													variant="ghost"
													onClick={() => handleSort("createdAt")}
													className="p-0 h-auto font-medium"
												>
													Created
													<ArrowUpDown className="ml-2 h-4 w-4" />
												</Button>
											</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{categories.map((category, index) => (
											<motion.tr
												key={category._id}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.2, delay: index * 0.05 }}
											>
												<TableCell>
													<Checkbox
														checked={selectedCategories.includes(category._id)}
														onCheckedChange={() =>
															toggleCategorySelection(category._id)
														}
													/>
												</TableCell>
												<TableCell>
													<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
														{category.icon ? (
															<img
																src={category.icon || "/placeholder.svg"}
																alt={category.name}
																className="w-full h-full object-cover rounded-lg"
															/>
														) : (
															<Package className="w-5 h-5" />
														)}
													</div>
												</TableCell>
												<TableCell>
													<div>
														<div className="font-medium">{category.name}</div>
														<div className="text-sm text-gray-500">
															/{category.slug}
														</div>
													</div>
												</TableCell>
												<TableCell>
													<div className="max-w-xs">
														<p className="text-sm text-gray-600 line-clamp-2">
															{category.description}
														</p>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<Badge
															variant="outline"
															className="bg-blue-50 text-blue-700"
														>
															{category.productCount || 0} products
														</Badge>
													</div>
												</TableCell>
												<TableCell>
													<Switch
														checked={category.published}
														onCheckedChange={(checked) =>
															handlePublishToggle(category._id, checked)
														}
													/>
												</TableCell>
												<TableCell>
													<div className="text-sm text-gray-500">
														{new Date(category.createdAt).toLocaleDateString()}
													</div>
												</TableCell>
												<TableCell>
													<div className="flex gap-2">
														<Button
															size="icon"
															variant="outline"
															onClick={() => handleUpdate(category)}
														>
															<Edit className="w-4 h-4" />
														</Button>
														<Button
															size="icon"
															variant="outline"
															className="text-red-600 hover:text-red-700 bg-transparent"
															onClick={() => handleDelete(category)}
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
											pagination.totalCategories
										)}{" "}
										of {pagination.totalCategories} categories
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
					setPopups((prev) => ({ ...prev, delete: { open, category: null } }))
				}
				itemName={popups.delete.category?.name}
				onConfirm={confirmDelete}
			/>

			<AddCategoryPopup
				open={popups.add}
				onOpenChange={(open) => setPopups((prev) => ({ ...prev, add: open }))}
			/>

			<UpdateCategoryPopup
				open={popups.update.open}
				onOpenChange={(open) =>
					setPopups((prev) => ({ ...prev, update: { open, category: null } }))
				}
				category={popups.update.category}
			/>
		</>
	);
}
