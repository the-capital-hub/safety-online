"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Search,
	Download,
	Upload,
	FileText,
	Plus,
	Filter,
	RotateCcw,
	Eye,
	Edit,
	Trash2,
} from "lucide-react";
import { DeletePopup } from "@/components/AdminPanel/Popups/DeletePopup.jsx";
import { UpdateCustomerPopup } from "@/components/AdminPanel/Popups/UpdateCustomerPopup.jsx";

const customers = [
	{
		id: "8989",
		joiningDate: "May 26, 2025",
		name: "Martin kumar",
		email: "martinkumar@gmail.com",
		phone: "24/05/2026",
	},
	{
		id: "8990",
		joiningDate: "June 15, 2025",
		name: "Sophia Lee",
		email: "sophialee@gmail.com",
		phone: "30/06/2026",
	},
	{
		id: "8991",
		joiningDate: "July 10, 2025",
		name: "James Smith",
		email: "jamessmith@gmail.com",
		phone: "14/07/2026",
	},
	{
		id: "8992",
		joiningDate: "August 22, 2025",
		name: "Olivia Brown",
		email: "oliviabrown@gmail.com",
		phone: "28/08/2026",
	},
];  

export default function CustomersPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [deletePopup, setDeletePopup] = useState({
		open: false,
		customer: null,
	});
	const [updatePopup, setUpdatePopup] = useState({
		open: false,
		customer: null,
	});

	const handleDelete = (customer) => {
		setDeletePopup({ open: true, customer });
	};

	const handleUpdate = (customer) => {
		setUpdatePopup({ open: true, customer });
	};

	const confirmDelete = () => {
		console.log("Deleting customer:", deletePopup.customer?.name);
		// Handle delete logic here
	};

	return (
		<>
			<div className="space-y-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					<h1 className="text-3xl font-bold text-gray-900">Customers</h1>
				</motion.div>

				<Card>
					<CardHeader>
						<div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
							<div className="flex flex-wrap gap-4 items-center">
								<Button
									variant="outline"
									className="text-orange-600 border-orange-600 bg-transparent"
								>
									<Download className="w-4 h-4 mr-2" />
									Export
								</Button>

								<Button variant="outline">
									<Upload className="w-4 h-4 mr-2" />
									Import
								</Button>

								<div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center gap-2">
									<FileText className="w-4 h-4 text-gray-400" />
									<span className="text-sm text-gray-600">
										Select your JSON Product file
									</span>
								</div>

								<Button className="bg-green-600 hover:bg-green-700">
									<Plus className="w-4 h-4 mr-2" />
									Import Now
								</Button>
							</div>
						</div>

						<div className="flex gap-4 items-center">
							<Button
								variant="outline"
								className="text-blue-600 bg-transparent"
							>
								<Download className="w-4 h-4 mr-2" />
								Export to CSV
							</Button>
							<Button
								variant="outline"
								className="text-green-600 bg-transparent"
							>
								<Download className="w-4 h-4 mr-2" />
								Export to JSON
							</Button>
						</div>

						<div className="flex gap-4 items-center">
							<div className="relative flex-1 max-w-md">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
								<Input
									placeholder="Search by Coupon"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10"
								/>
							</div>
							<Button className="bg-green-600 hover:bg-green-700">
								<Filter className="w-4 h-4 mr-2" />
								Filter
							</Button>
							<Button variant="outline">
								<RotateCcw className="w-4 h-4 mr-2" />
								Reset
							</Button>
						</div>
					</CardHeader>

					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>ID</TableHead>
									<TableHead>Joining Date</TableHead>
									<TableHead>Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Phone</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{customers.map((customer) => (
									<motion.tr
										key={customer.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.2 }}
									>
										<TableCell className="font-medium">{customer.id}</TableCell>
										<TableCell>{customer.joiningDate}</TableCell>
										<TableCell>{customer.name}</TableCell>
										<TableCell>{customer.email}</TableCell>
										<TableCell>{customer.phone}</TableCell>
										<TableCell>
											<div className="flex gap-2">
												<Button size="icon" variant="outline">
													<Eye className="w-4 h-4" />
												</Button>
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

						<div className="flex items-center justify-between mt-4">
							<p className="text-sm text-gray-600">Showing 1-2 of 2</p>
							<div className="flex gap-2">
								<Button variant="outline" size="sm">
									Previous
								</Button>
								<Button size="sm" className="bg-black text-white">
									1
								</Button>
								<Button variant="outline" size="sm">
									2
								</Button>
								<Button variant="outline" size="sm">
									3
								</Button>
								<Button variant="outline" size="sm">
									4
								</Button>
								<Button variant="outline" size="sm">
									Next
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<DeletePopup
				open={deletePopup.open}
				onOpenChange={(open) => setDeletePopup({ open, customer: null })}
				itemName={deletePopup.customer?.name}
				onConfirm={confirmDelete}
			/>

			<UpdateCustomerPopup
				open={updatePopup.open}
				onOpenChange={(open) => setUpdatePopup({ open, customer: null })}
				customer={updatePopup.customer}
			/>
		</>
	);
}
