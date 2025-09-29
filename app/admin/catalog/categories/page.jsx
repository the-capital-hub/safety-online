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
} from "lucide-react";
import { useAdminCategoryStore } from "@/store/adminCategoryStore.js";
import { DeleteCategoriesPopup } from "@/components/AdminPanel/Popups/DeleteCategoriesPopup.jsx";
import { AddCategoryPopup } from "@/components/AdminPanel/Popups/AddCategoryPopup.jsx";
import { UpdateCategoryPopup } from "@/components/AdminPanel/Popups/UpdateCategoryPopup.jsx";
import { useIsAuthenticated } from "@/store/adminAuthStore.js";
import { useRouter } from "next/navigation";

export default function AdminCategoriesPage() {
	const isAuthenticated = useIsAuthenticated();
	const [isRedirecting, setIsRedirecting] = useState(false);
	const router = useRouter();
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
                sortBy,
                sortOrder,
        } = useAdminCategoryStore();

        const [navOrderDrafts, setNavOrderDrafts] = useState({});
        const [navOrderSaving, setNavOrderSaving] = useState({});

        useEffect(() => {
                const initialDrafts = categories.reduce((acc, category) => {
                        acc[category._id] =
                                category.navigationOrder === undefined ||
                                category.navigationOrder === null
                                        ? ""
                                        : String(category.navigationOrder);
                        return acc;
                }, {});

                setNavOrderDrafts(initialDrafts);
        }, [categories]);

	const [popups, setPopups] = useState({
		delete: { open: false, category: null },
		add: false,
		update: { open: false, category: null },
	});

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);
	useEffect(() => {
		if (!isAuthenticated) {
			setIsRedirecting(true);
			const timer = setTimeout(() => {
				router.push("/admin/login");
			}, 3);

			return () => clearTimeout(timer);
		}
	}, [isAuthenticated, router]);

	// Show redirecting message if not authenticated
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
                const currentOrder =
                        sortBy === field && sortOrder === "asc" ? "desc" : "asc";
                setSorting(field, currentOrder);
        };

        const handleNavOrderChange = (categoryId, value) => {
                setNavOrderDrafts((prev) => ({
                        ...prev,
                        [categoryId]: value,
                }));
        };

        const commitNavOrderChange = async (categoryId) => {
                if (navOrderSaving[categoryId]) {
                        return;
                }

                const draftValue = navOrderDrafts[categoryId];
                const parsedValue = Number(draftValue);

                const normalizedValue =
                        draftValue === "" || !Number.isFinite(parsedValue) || parsedValue < 0
                                ? 0

                                : Math.floor(parsedValue);


                const category = categories.find((cat) => cat._id === categoryId);
                if (!category) return;

                if ((category.navigationOrder || 0) === normalizedValue) {
                        // Ensure empty drafts reflect normalized value
                        setNavOrderDrafts((prev) => ({
                                ...prev,
                                [categoryId]: String(normalizedValue),
                        }));
                        return;
                }

                setNavOrderSaving((prev) => ({ ...prev, [categoryId]: true }));
                try {
                        const success = await updateCategory(categoryId, {
                                navigationOrder: normalizedValue,
                        });
                        if (!success) {
                                setNavOrderDrafts((prev) => ({
                                        ...prev,
                                        [categoryId]: String(category.navigationOrder || 0),
                                }));
                        }
                } finally {
                        setNavOrderSaving((prev) => ({ ...prev, [categoryId]: false }));
                }
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
						Organize and manage product categories
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
									<Input name="searchQuery"
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
											<TableHead>Subcategories</TableHead>
                                                                                        <TableHead>Products</TableHead>
                                                                                        <TableHead>
                                                                                                <Button
                                                                                                        variant="ghost"
                                                                                                        onClick={() =>
                                                                                                                handleSort(
                                                                                                                        "navigationOrder"
                                                                                                                )
                                                                                                        }
                                                                                                        className="p-0 h-auto font-medium"
                                                                                                >
                                                                                                        Nav Order
                                                                                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                                                                                </Button>
                                                                                        </TableHead>
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
													<div>
														<div className="font-medium">{category.name}</div>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex flex-wrap gap-2 max-w-md">
														{(category.subCategories || []).length === 0 ? (
															<span className="text-sm text-gray-500">
																No subcategories
															</span>
														) : (
															(category.subCategories || []).map((sub, i) => (
																<Badge
																	key={i}
																	variant="outline"
																	className={
																		sub.published
																			? "bg-green-50 text-green-700"
																			: "bg-gray-50 text-gray-600"
																	}
																>
																	{sub.name}
																</Badge>
															))
														)}
													</div>
												</TableCell>
												<TableCell>
													<Badge
														variant="outline"
														className="bg-blue-50 text-blue-700"
													>
														{category.productCount || 0} products
													</Badge>
												</TableCell>
                                                                                                <TableCell>
                                                                                                        <div className="max-w-[6rem]">
                                                                                                                <Input
                                                                                                                        type="number"
                                                                                                                        min={0}
                                                                                                                        value={
                                                                                                                                navOrderDrafts[category._id] ?? ""
                                                                                                                        }
                                                                                                                        onChange={(e) =>
                                                                                                                                handleNavOrderChange(
                                                                                                                                        category._id,
                                                                                                                                        e.target.value
                                                                                                                                )
                                                                                                                        }
                                                                                                                        onBlur={() =>
                                                                                                                                commitNavOrderChange(
                                                                                                                                        category._id
                                                                                                                                )
                                                                                                                        }
                                                                                                                        onKeyDown={(e) => {
                                                                                                                                if (e.key === "Enter") {
                                                                                                                                        commitNavOrderChange(
                                                                                                                                                category._id
                                                                                                                                        );
                                                                                                                                }
                                                                                                                        }}
                                                                                                                        disabled={!!navOrderSaving[category._id]}
                                                                                                                        className="h-9"
                                                                                                                />
                                                                                                        </div>
                                                                                                </TableCell>
                                                                                                <TableCell>
                                                                                                        <Switch
                                                                                                                checked={!!category.published}
                                                                                                                onCheckedChange={(checked) =>
                                                                                                                        handlePublishToggle(category._id, checked)
                                                                                                                }
                                                                                                        />
                                                                                                </TableCell>
												<TableCell>
													<div className="text-sm text-gray-500">
														{category.createdAt
															? new Date(
																	category.createdAt
															  ).toLocaleDateString()
															: ""}
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
			<DeleteCategoriesPopup
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
