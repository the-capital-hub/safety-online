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
	Percent,
	Calendar,
	Eye,
} from "lucide-react";
import { useAdminCouponStore } from "@/store/adminCouponStore.js";
import { DeletePopup } from "@/components/AdminPanel/Popups/DeletePopup.jsx";
import { AddCouponPopup } from "@/components/AdminPanel/Popups/AddCouponPopup.jsx";
import { UpdateCouponPopup } from "@/components/AdminPanel/Popups/UpdateCouponPopup.jsx";
import { useIsAuthenticated } from "@/store/adminAuthStore.js";
import { useRouter } from "next/navigation";

export default function AdminCouponsPage() {
	const {
		coupons,
		isLoading,
		error,
		filters,
		pagination,
		selectedCoupons,
		fetchCoupons,
		setFilters,
		resetFilters,
		setPage,
		setSorting,
		selectAllCoupons,
		clearSelection,
		toggleCouponSelection,
		deleteCoupon,
		deleteMultipleCoupons,
		updateCoupon,
		exportToCSV,
		exportToJSON,
	} = useAdminCouponStore();

	const [popups, setPopups] = useState({
		delete: { open: false, coupon: null },
		add: false,
		update: { open: false, coupon: null },
	});
	const isAuthenticated = useIsAuthenticated();
	const [isRedirecting, setIsRedirecting] = useState(false);
	const router = useRouter();

	useEffect(() => {
		fetchCoupons();
	}, [fetchCoupons]);

	useEffect(() => {
		if (!isAuthenticated) {
			setIsRedirecting(true);
			const timer = setTimeout(() => {
				router.push("/admin/login");
			}, 3);

			return () => clearTimeout(timer);
		}
	}, [isAuthenticated, router]);

	const handleSearch = (value) => {
		setFilters({ search: value });
	};

	const handleFilterChange = (key, value) => {
		setFilters({ [key]: value });
	};

	const handleApplyFilters = () => {
		fetchCoupons();
	};

	const handleSelectAll = (checked) => {
		if (checked) {
			selectAllCoupons();
		} else {
			clearSelection();
		}
	};

	const handleDelete = (coupon) => {
		setPopups((prev) => ({ ...prev, delete: { open: true, coupon } }));
	};

	const handleUpdate = (coupon) => {
		setPopups((prev) => ({ ...prev, update: { open: true, coupon } }));
	};

	const confirmDelete = async () => {
		if (popups.delete.coupon) {
			await deleteCoupon(popups.delete.coupon._id);
		}
	};

	const handleBulkDelete = async () => {
		if (selectedCoupons.length > 0) {
			await deleteMultipleCoupons(selectedCoupons);
		}
	};

        const handlePublishToggle = async (couponId, published) => {
                await updateCoupon(couponId, { published });
        };

        const handleRecommendedToggle = async (couponId, recommended) => {
                await updateCoupon(couponId, { recommended });
        };

	const handleSort = (field) => {
		const currentOrder = filters.sortOrder === "desc" ? "asc" : "desc";
		setSorting(field, currentOrder);
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "Active":
				return "bg-green-100 text-green-800";
			case "Expired":
				return "bg-red-100 text-red-800";
			case "Scheduled":
				return "bg-blue-100 text-blue-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};
	// Show redirecting message if not authenticated
	if (!isAuthenticated) {
		return (
			<div className="flex items-center justify-center py-4 px-6 bg-white">
				<div className="text-gray-600">Redirecting to login...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
					<p className="text-gray-600 mb-4">{error}</p>
					<Button onClick={fetchCoupons}>Try Again</Button>
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
						Coupons Management
					</h1>
					<p className="text-gray-600 mt-1">
						Create and manage promotional coupons and discount codes
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
										<Upload className="w-4 h-4 mr-2" />
										Export JSON
									</Button>

									{selectedCoupons.length > 0 && (
										<Button
											variant="destructive"
											onClick={handleBulkDelete}
											className="bg-red-600 hover:bg-red-700"
										>
											<Trash2 className="w-4 h-4 mr-2" />
											Delete Selected ({selectedCoupons.length})
										</Button>
									)}
								</div>

								<Button
									onClick={() => setPopups((prev) => ({ ...prev, add: true }))}
									className="bg-green-600 hover:bg-green-700"
								>
									<Plus className="w-4 h-4 mr-2" />
									Add Coupon
								</Button>
							</div>

							{/* Search and Filter Row */}
							<div className="flex gap-4 items-center flex-wrap">
								<div className="relative flex-1 max-w-md">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
									<Input
										placeholder="Search coupons..."
										value={filters.search}
										onChange={(e) => handleSearch(e.target.value)}
										className="pl-10"
									/>
								</div>

								<Select
									value={filters.status}
									onValueChange={(value) => handleFilterChange("status", value)}
								>
									<SelectTrigger className="w-32">
										<SelectValue placeholder="Status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Status</SelectItem>
										<SelectItem value="Active">Active</SelectItem>
										<SelectItem value="Expired">Expired</SelectItem>
										<SelectItem value="Scheduled">Scheduled</SelectItem>
									</SelectContent>
								</Select>

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
										<SelectValue placeholder="Published" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All</SelectItem>
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
														selectedCoupons.length === coupons.length &&
														coupons.length > 0
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
													Campaign Name
													<ArrowUpDown className="ml-2 h-4 w-4" />
												</Button>
											</TableHead>
											<TableHead>Code</TableHead>
											<TableHead>
												<Button
													variant="ghost"
													onClick={() => handleSort("discount")}
													className="p-0 h-auto font-medium"
												>
													Discount
													<ArrowUpDown className="ml-2 h-4 w-4" />
												</Button>
											</TableHead>
											<TableHead>
												<Button
													variant="ghost"
													onClick={() => handleSort("startDate")}
													className="p-0 h-auto font-medium"
												>
													Start Date
													<ArrowUpDown className="ml-2 h-4 w-4" />
												</Button>
											</TableHead>
											<TableHead>
												<Button
													variant="ghost"
													onClick={() => handleSort("endDate")}
													className="p-0 h-auto font-medium"
												>
													End Date
													<ArrowUpDown className="ml-2 h-4 w-4" />
												</Button>
											</TableHead>
                                                                                        <TableHead>Status</TableHead>
                                                                                        <TableHead>Recommended</TableHead>
                                                                                        <TableHead>Published</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{coupons.map((coupon, index) => (
											<motion.tr
												key={coupon._id}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.2, delay: index * 0.05 }}
											>
												<TableCell>
													<Checkbox
														checked={selectedCoupons.includes(coupon._id)}
														onCheckedChange={() =>
															toggleCouponSelection(coupon._id)
														}
													/>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-3">
														<div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white">
															<Percent className="w-5 h-5" />
														</div>
                                                                                                                <div>
                                                                                                                        <div className="flex items-center gap-2">
                                                                                                                                <span className="font-medium">{coupon.name}</span>
                                                                                                                                {coupon.recommended && (
                                                                                                                                        <Badge className="bg-blue-50 text-blue-700 border border-blue-200">
                                                                                                                                                Recommended
                                                                                                                                        </Badge>
                                                                                                                                )}
                                                                                                                        </div>
                                                                                                                        <div className="text-sm text-gray-500">
                                                                                                                                Campaign
                                                                                                                        </div>
                                                                                                                </div>
                                                                                                       </div>
                                                                                               </TableCell>
												<TableCell>
													<div className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm inline-block">
														{coupon.code}
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-1">
														<span className="font-bold text-green-600">
															{coupon.discount}%
														</span>
														<span className="text-gray-500">OFF</span>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<Calendar className="w-4 h-4 text-gray-400" />
														<span className="text-sm">
															{formatDate(coupon.startDate)}
														</span>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<Calendar className="w-4 h-4 text-gray-400" />
														<span className="text-sm">
															{formatDate(coupon.endDate)}
														</span>
													</div>
												</TableCell>
                                                                                                <TableCell>
                                                                                                        <Badge className={getStatusColor(coupon.status)}>
                                                                                                                {coupon.status}
                                                                                                        </Badge>
                                                                                                </TableCell>
                                                                                                <TableCell>
                                                                                                        <Switch
                                                                                                                checked={coupon.recommended}
                                                                                                                onCheckedChange={(checked) =>
                                                                                                                        handleRecommendedToggle(
                                                                                                                                coupon._id,
                                                                                                                                checked
                                                                                                                        )
                                                                                                                }
                                                                                                        />
                                                                                                </TableCell>
                                                                                                <TableCell>
                                                                                                        <Switch
                                                                                                                checked={coupon.published}
                                                                                                                onCheckedChange={(checked) =>
                                                                                                                        handlePublishToggle(coupon._id, checked)
														}
													/>
												</TableCell>
												<TableCell>
													<div className="flex gap-2">
														<Button size="icon" variant="outline">
															<Eye className="w-4 h-4" />
														</Button>
														<Button
															size="icon"
															variant="outline"
															onClick={() => handleUpdate(coupon)}
														>
															<Edit className="w-4 h-4" />
														</Button>
														<Button
															size="icon"
															variant="outline"
															className="text-red-600 hover:text-red-700 bg-transparent"
															onClick={() => handleDelete(coupon)}
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
											pagination.totalCoupons
										)}{" "}
										of {pagination.totalCoupons} coupons
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
					setPopups((prev) => ({ ...prev, delete: { open, coupon: null } }))
				}
				title="Delete Coupon"
				itemName={popups.delete.coupon?.name}
				onConfirm={confirmDelete}
			/>

			<AddCouponPopup
				open={popups.add}
				onOpenChange={(open) => setPopups((prev) => ({ ...prev, add: open }))}
			/>

			<UpdateCouponPopup
				open={popups.update.open}
				onOpenChange={(open) =>
					setPopups((prev) => ({ ...prev, update: { open, coupon: null } }))
				}
				coupon={popups.update.coupon}
			/>
		</>
	);
}
