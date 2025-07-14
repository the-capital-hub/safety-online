"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Calendar,
	Search,
	Download,
	Filter,
	RotateCcw,
	Eye,
	Printer,
} from "lucide-react";
import { InvoicePopup } from "@/components/AdminPanel/Popups/InvoicePopup.jsx";

const orders = [
	{
		id: "SB001",
		date: "23/05/2025 11:33 am",
		customer: "Rakesh Kumar",
		method: "Cash",
		price: "$61.00",
		status: "Processing",
	},
	{
		id: "SB002",
		date: "24/05/2025 12:00 pm",
		customer: "Anita Singh",
		method: "Credit Card",
		price: "$91.00",
		status: "Completed",
	},
	{
		id: "SB003",
		date: "25/05/2025 2:15 pm",
		customer: "Vikram Sharma",
		method: "Debit Card",
		price: "$36.00",
		status: "Failed",
	},
	{
		id: "SB004",
		date: "26/05/2025 9:45 am",
		customer: "Nisha Patel",
		method: "Net Banking",
		price: "$121.00",
		status: "Processing",
	},
	{
		id: "SB005",
		date: "27/05/2025 1:30 pm",
		customer: "Ravi Gupta",
		method: "Cash",
		price: "$16.00",
		status: "Completed",
	},
];

export default function OrdersPage() {
	const [selectedInvoice, setSelectedInvoice] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");

	const getStatusColor = (status) => {
		switch (status.toLowerCase()) {
			case "completed":
				return "bg-green-100 text-green-800";
			case "processing":
				return "bg-yellow-100 text-yellow-800";
			case "failed":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<>
			<div className="space-y-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					<h1 className="text-3xl font-bold text-gray-900">Orders</h1>
				</motion.div>

				<Card>
					<CardHeader>
						<div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
							<div className="flex flex-wrap gap-4 items-center">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
									<Input
										placeholder="Search by Customer name"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-10 w-64"
									/>
								</div>

								<Select value={statusFilter} onValueChange={setStatusFilter}>
									<SelectTrigger className="w-32">
										<SelectValue placeholder="Status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Status</SelectItem>
										<SelectItem value="processing">Processing</SelectItem>
										<SelectItem value="completed">Completed</SelectItem>
										<SelectItem value="failed">Failed</SelectItem>
									</SelectContent>
								</Select>

								<Select>
									<SelectTrigger className="w-40">
										<SelectValue placeholder="Order Limits" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="10">10 orders</SelectItem>
										<SelectItem value="25">25 orders</SelectItem>
										<SelectItem value="50">50 orders</SelectItem>
									</SelectContent>
								</Select>

								<Select>
									<SelectTrigger className="w-32">
										<SelectValue placeholder="Method" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Methods</SelectItem>
										<SelectItem value="cash">Cash</SelectItem>
										<SelectItem value="card">Card</SelectItem>
										<SelectItem value="banking">Net Banking</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<Button className="bg-green-600 hover:bg-green-700">
								<Download className="w-4 h-4 mr-2" />
								Download all orders
							</Button>
						</div>

						<div className="flex gap-4 items-center">
							<div className="flex items-center gap-2">
								<Calendar className="w-4 h-4 text-gray-400" />
								<Input type="date" className="w-40" placeholder="Start Date" />
							</div>
							<div className="flex items-center gap-2">
								<Calendar className="w-4 h-4 text-gray-400" />
								<Input type="date" className="w-40" placeholder="End Date" />
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
									<TableHead>Invoice NO</TableHead>
									<TableHead>Order time</TableHead>
									<TableHead>Customer Name</TableHead>
									<TableHead>Method</TableHead>
									<TableHead>Price</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Action</TableHead>
									<TableHead>Invoice</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{orders.map((order) => (
									<motion.tr
										key={order.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.2 }}
									>
										<TableCell className="font-medium">{order.id}</TableCell>
										<TableCell>{order.date}</TableCell>
										<TableCell>{order.customer}</TableCell>
										<TableCell>{order.method}</TableCell>
										<TableCell className="font-medium text-blue-600">
											{order.price}
										</TableCell>
										<TableCell>
											<Badge className={getStatusColor(order.status)}>
												{order.status}
											</Badge>
										</TableCell>
										<TableCell>
											<Select defaultValue="processing">
												<SelectTrigger className="w-32">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="processing">Processing</SelectItem>
													<SelectItem value="completed">Completed</SelectItem>
													<SelectItem value="failed">Failed</SelectItem>
												</SelectContent>
											</Select>
										</TableCell>
										<TableCell>
											<div className="flex gap-2">
												<Button
													size="icon"
													variant="outline"
													onClick={() => setSelectedInvoice(order)}
												>
													<Printer className="w-4 h-4" />
												</Button>
												<Button size="icon" variant="outline">
													<Eye className="w-4 h-4" />
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

			<InvoicePopup
				open={!!selectedInvoice}
				onOpenChange={() => setSelectedInvoice(null)}
				order={selectedInvoice}
			/>
		</>
	);
}
