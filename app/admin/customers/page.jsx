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
	User,
	Calendar,
	Mail,
	Phone,
} from "lucide-react";
import { useAdminCustomerStore } from "@/store/adminCustomerStore.js";
import { DeleteCustomerPopup } from "@/components/AdminPanel/Popups/DeleteCustomerPopup.jsx";
import { AddCustomerPopup } from "@/components/AdminPanel/Popups/AddCustomerPopup.jsx";
import { UpdateCustomerPopup } from "@/components/AdminPanel/Popups/UpdateCustomerPopup.jsx";

export default function AdminCustomersPage() {
	const {
		customers,
		loading,
		pagination,
		filters,
		fetchCustomers,
		deleteCustomer,
		bulkDeleteCustomers,
		setFilters,
		resetFilters,
	} = useAdminCustomerStore();

	const [selectedCustomers, setSelectedCustomers] = useState([]);
	const [deletePopup, setDeletePopup] = useState({
		open: false,
		customer: null,
	});
	const [addPopup, setAddPopup] = useState(false);
	const [updatePopup, setUpdatePopup] = useState({
		open: false,
		customer: null,
	});

	useEffect(() => {
		fetchCustomers();
	}, []);

	const handleSearch = (value) => {
		setFilters({ search: value });
		fetchCustomers({ ...filters, search: value, page: 1 });
	};

	const handleStatusFilter = (status) => {
		setFilters({ status });
		fetchCustomers({ ...filters, status, page: 1 });
	};

	const handleReset = () => {
		resetFilters();
		fetchCustomers({ search: "", status: "", page: 1 });
	};

	const handleSelectAll = (checked) => {
		if (checked) {
			setSelectedCustomers(customers.map((customer) => customer._id));
		} else {
			setSelectedCustomers([]);
		}
	};

	const handleSelectCustomer = (customerId, checked) => {
		if (checked) {
			setSelectedCustomers([...selectedCustomers, customerId]);
		} else {
			setSelectedCustomers(selectedCustomers.filter((id) => id !== customerId));
		}
	};

	const handleDelete = (customer) => {
		setDeletePopup({ open: true, customer });
	};

	const handleUpdate = (customer) => {
		setUpdatePopup({ open: true, customer });
	};

	const confirmDelete = async () => {
		if (deletePopup.customer) {
			await deleteCustomer(deletePopup.customer._id);
		}
	};

	const handleBulkDelete = async () => {
		if (selectedCustomers.length > 0) {
			await bulkDeleteCustomers(selectedCustomers);
			setSelectedCustomers([]);
		}
	};

	const handlePageChange = (page) => {
		fetchCustomers({ ...filters, page });
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

	if (loading && customers.length === 0) {
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
						<div className="p-2 bg-blue-100 rounded-lg">
							<User className="w-6 h-6 text-blue-600" />
						</div>
						<div>
							<h1 className="text-3xl font-bold text-gray-900">Customers</h1>
							<p className="text-gray-600">Manage your customer accounts</p>
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

									{selectedCustomers.length > 0 && (
										<Button
											variant="destructive"
											onClick={handleBulkDelete}
											className="bg-red-600 hover:bg-red-700"
										>
											<Trash2 className="w-4 h-4 mr-2" />
											Delete ({selectedCustomers.length})
										</Button>
									)}
								</div>

								<Button
									onClick={() => setAddPopup(true)}
									className="bg-green-600 hover:bg-green-700"
								>
									<Plus className="w-4 h-4 mr-2" />
									Add Customer
								</Button>
							</div>

							{/* Search and Filter Row */}
							<div className="flex gap-4 items-center">
								<div className="relative flex-1 max-w-md">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
									<Input
										placeholder="Search customers..."
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
												selectedCustomers.length === customers.length &&
												customers.length > 0
											}
											onCheckedChange={handleSelectAll}
										/>
									</TableHead>
									<TableHead>Customer</TableHead>
									<TableHead>Contact</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Joined</TableHead>
									<TableHead>Last Login</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{customers.map((customer, index) => (
									<motion.tr
										key={customer._id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.2, delay: index * 0.05 }}
									>
										<TableCell>
											<Checkbox
												checked={selectedCustomers.includes(customer._id)}
												onCheckedChange={(checked) =>
													handleSelectCustomer(customer._id, checked)
												}
											/>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
													{customer.firstName?.charAt(0)}
													{customer.lastName?.charAt(0)}
												</div>
												<div>
													<div className="font-medium">
														{customer.firstName} {customer.lastName}
													</div>
													<div className="text-sm text-gray-500">
														ID: {customer._id.slice(-6)}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="space-y-1">
												<div className="flex items-center gap-2 text-sm">
													<Mail className="w-3 h-3 text-gray-400" />
													{customer.email}
												</div>
												{customer.mobile && (
													<div className="flex items-center gap-2 text-sm text-gray-600">
														<Phone className="w-3 h-3 text-gray-400" />
														{customer.mobile}
													</div>
												)}
											</div>
										</TableCell>
										<TableCell>
											<Badge className={getStatusColor(customer.status)}>
												{customer.status}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2 text-sm">
												<Calendar className="w-3 h-3 text-gray-400" />
												{formatDate(customer.createdAt)}
											</div>
										</TableCell>
										<TableCell>
											<div className="text-sm text-gray-600">
												{customer.lastLogin
													? formatDate(customer.lastLogin)
													: "Never"}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex gap-2">
												<Button
													size="icon"
													variant="outline"
													onClick={() => handleUpdate(customer)}
												>
													<Edit className="w-4 h-4" />
												</Button>
												<Button
													size="icon"
													variant="outline"
													className="text-red-600 hover:text-red-700 bg-transparent"
													onClick={() => handleDelete(customer)}
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

			<DeleteCustomerPopup
				open={deletePopup.open}
				onOpenChange={(open) => setDeletePopup({ open, customer: null })}
				itemName={
					deletePopup.customer
						? `${deletePopup.customer.firstName} ${deletePopup.customer.lastName}`
						: ""
				}
				onConfirm={confirmDelete}
			/>

			<AddCustomerPopup open={addPopup} onOpenChange={setAddPopup} />

			<UpdateCustomerPopup
				open={updatePopup.open}
				onOpenChange={(open) => setUpdatePopup({ open, customer: null })}
				customer={updatePopup.customer}
			/>
		</>
	);
}
