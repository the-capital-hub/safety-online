"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Search,
	Plus,
	RotateCcw,
	Edit,
	Trash2,
	Upload,
	Download,
	MoreHorizontal,
	Store,
	Calendar,
	Mail,
	Phone,
} from "lucide-react";
import { useAdminSellerStore } from "@/store/adminSellerStore.js";
import { DeleteSellerPopup } from "@/components/AdminPanel/Popups/DeleteSellerPopup.jsx";
import { AddSellerPopup } from "@/components/AdminPanel/Popups/AddSellerPopup.jsx";
import { UpdateSellerPopup } from "@/components/AdminPanel/Popups/UpdateSellerPopup.jsx";
import { useIsAuthenticated } from "@/store/adminAuthStore.js";
import { useRouter } from "next/navigation";

export default function AdminSellersPage() {
	const {
		sellers,
		loading,
		pagination,
		filters,
		fetchSellers,
		deleteSeller,
		bulkDeleteSellers,
		setFilters,
		resetFilters,
	} = useAdminSellerStore();

	const [selectedSellers, setSelectedSellers] = useState([]);
	const [deletePopup, setDeletePopup] = useState({
		open: false,
		seller: null,
	});
	const [addPopup, setAddPopup] = useState(false);
	const [updatePopup, setUpdatePopup] = useState({
		open: false,
		seller: null,
	});
	const isAuthenticated = useIsAuthenticated();
	const [isRedirecting, setIsRedirecting] = useState(false);
	const router = useRouter();

	useEffect(() => {
		fetchSellers();
	}, []);

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
		fetchSellers({ ...filters, search: value, page: 1 });
	};

	const handleStatusFilter = (status) => {
		setFilters({ status });
		fetchSellers({ ...filters, status, page: 1 });
	};

	const handleReset = () => {
		resetFilters();
		fetchSellers({ search: "", status: "", page: 1 });
	};

	const handleSelectAll = (checked) => {
		if (checked) {
			setSelectedSellers(sellers.map((seller) => seller._id));
		} else {
			setSelectedSellers([]);
		}
	};

	const handleSelectSeller = (sellerId, checked) => {
		if (checked) {
			setSelectedSellers([...selectedSellers, sellerId]);
		} else {
			setSelectedSellers(selectedSellers.filter((id) => id !== sellerId));
		}
	};

	const handleDelete = (seller) => {
		setDeletePopup({ open: true, seller });
	};

	const handleUpdate = (seller) => {
		setUpdatePopup({ open: true, seller });
	};

	const confirmDelete = async () => {
		if (deletePopup.seller) {
			await deleteSeller(deletePopup.seller._id);
		}
	};

	const handleBulkDelete = async () => {
		if (selectedSellers.length > 0) {
			await bulkDeleteSellers(selectedSellers);
			setSelectedSellers([]);
		}
	};

	const handlePageChange = (page) => {
		fetchSellers({ ...filters, page });
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "active":
				return "bg-green-100 text-green-800";
			case "inactive":
				return "bg-gray-100 text-gray-800";
			case "suspended":
				return "bg-red-100 text-red-800";
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

	if (loading && sellers.length === 0) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
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
					<div className="flex items-center gap-3">
						<div className="p-2 bg-purple-100 rounded-lg">
							<Store className="w-6 h-6 text-purple-600" />
						</div>
						<div>
							<h1 className="text-3xl font-bold text-gray-900">Sellers</h1>
							<p className="text-gray-600">Manage your seller accounts</p>
						</div>
					</div>
				</motion.div>

				<Card>
					<CardHeader>
						<div className="flex flex-col gap-4">
							{/* Export/Import Row */}
							<div className="flex flex-wrap gap-4 items-center justify-between">
								<div className="flex gap-4 items-center">
									<Button
										variant="outline"
										className="text-orange-600 border-orange-600 bg-transparent"
									>
										<Upload className="w-4 h-4 mr-2" />
										Export
									</Button>

									<Button variant="outline">
										<Download className="w-4 h-4 mr-2" />
										Import
									</Button>

									<Button
										variant="outline"
										className="text-blue-600 border-blue-600 bg-transparent"
									>
										<MoreHorizontal className="w-4 h-4 mr-2" />
										Bulk Action
									</Button>

									{selectedSellers.length > 0 && (
										<Button
											variant="destructive"
											onClick={handleBulkDelete}
											className="bg-red-600 hover:bg-red-700"
										>
											<Trash2 className="w-4 h-4 mr-2" />
											Delete ({selectedSellers.length})
										</Button>
									)}
								</div>

								<Button
									onClick={() => setAddPopup(true)}
									className="bg-green-600 hover:bg-green-700"
								>
									<Plus className="w-4 h-4 mr-2" />
									Add Seller
								</Button>
							</div>

							{/* Search and Filter Row */}
							<div className="flex gap-4 items-center">
								<div className="relative flex-1 max-w-md">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
									<Input
										placeholder="Search sellers..."
										value={filters.search}
										onChange={(e) => handleSearch(e.target.value)}
										className="pl-10"
									/>
								</div>

								<Select
									value={filters.status}
									onValueChange={handleStatusFilter}
								>
									<SelectTrigger className="w-40">
										<SelectValue placeholder="Status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Status</SelectItem>
										<SelectItem value="active">Active</SelectItem>
										<SelectItem value="inactive">Inactive</SelectItem>
										<SelectItem value="suspended">Suspended</SelectItem>
									</SelectContent>
								</Select>

								<Button variant="outline" onClick={handleReset}>
									<RotateCcw className="w-4 h-4 mr-2" />
									Reset
								</Button>
							</div>
						</div>
					</CardHeader>

					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12">
										<Checkbox
											checked={
												selectedSellers.length === sellers.length &&
												sellers.length > 0
											}
											onCheckedChange={handleSelectAll}
										/>
									</TableHead>
									<TableHead>Seller</TableHead>
									<TableHead>Contact</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Joined</TableHead>
									<TableHead>Last Login</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{sellers.map((seller, index) => (
									<motion.tr
										key={seller._id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.2, delay: index * 0.05 }}
									>
										<TableCell>
											<Checkbox
												checked={selectedSellers.includes(seller._id)}
												onCheckedChange={(checked) =>
													handleSelectSeller(seller._id, checked)
												}
											/>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
													{seller.firstName?.charAt(0)}
													{seller.lastName?.charAt(0)}
												</div>
												<div>
													<div className="font-medium">
														{seller.firstName} {seller.lastName}
													</div>
													<div className="text-sm text-gray-500">
														ID: {seller._id.slice(-6)}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="space-y-1">
												<div className="flex items-center gap-2 text-sm">
													<Mail className="w-3 h-3 text-gray-400" />
													{seller.email}
												</div>
												{seller.mobile && (
													<div className="flex items-center gap-2 text-sm text-gray-600">
														<Phone className="w-3 h-3 text-gray-400" />
														{seller.mobile}
													</div>
												)}
											</div>
										</TableCell>
										<TableCell>
											<Badge className={getStatusColor(seller.status)}>
												{seller.status}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2 text-sm">
												<Calendar className="w-3 h-3 text-gray-400" />
												{formatDate(seller.createdAt)}
											</div>
										</TableCell>
										<TableCell>
											<div className="text-sm text-gray-600">
												{seller.lastLogin
													? formatDate(seller.lastLogin)
													: "Never"}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex gap-2">
												<Button
													size="icon"
													variant="outline"
													onClick={() => handleUpdate(seller)}
												>
													<Edit className="w-4 h-4" />
												</Button>
												<Button
													size="icon"
													variant="outline"
													className="text-red-600 hover:text-red-700 bg-transparent"
													onClick={() => handleDelete(seller)}
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
						<div className="flex items-center justify-between mt-4">
							<p className="text-sm text-gray-600">
								Showing {(pagination.page - 1) * pagination.limit + 1}-
								{Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
								of {pagination.total}
							</p>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									disabled={pagination.page === 1}
									onClick={() => handlePageChange(pagination.page - 1)}
								>
									Previous
								</Button>
								{Array.from(
									{ length: Math.min(5, pagination.pages) },
									(_, i) => {
										const page = i + 1;
										return (
											<Button
												key={page}
												size="sm"
												variant={
													pagination.page === page ? "default" : "outline"
												}
												onClick={() => handlePageChange(page)}
											>
												{page}
											</Button>
										);
									}
								)}
								<Button
									variant="outline"
									size="sm"
									disabled={pagination.page === pagination.pages}
									onClick={() => handlePageChange(pagination.page + 1)}
								>
									Next
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<DeleteSellerPopup
				open={deletePopup.open}
				onOpenChange={(open) => setDeletePopup({ open, seller: null })}
				itemName={
					deletePopup.seller
						? `${deletePopup.seller.firstName} ${deletePopup.seller.lastName}`
						: ""
				}
				onConfirm={confirmDelete}
			/>

			<AddSellerPopup open={addPopup} onOpenChange={setAddPopup} />

			<UpdateSellerPopup
				open={updatePopup.open}
				onOpenChange={(open) => setUpdatePopup({ open, seller: null })}
				seller={updatePopup.seller}
			/>
		</>
	);
}
