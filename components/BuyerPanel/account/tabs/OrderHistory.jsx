"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Eye, Download } from "lucide-react";

const orders = [
	{
		id: "#5302002",
		product: "Helmet",
		color: "yellow",
		qty: 2,
		date: "June 2, 2025",
		price: "$253.82",
		status: "Delivered",
	},
	{
		id: "#5302003",
		product: "Gloves",
		color: "black",
		qty: 3,
		date: "June 5, 2025",
		price: "$45.99",
		status: "In Transit",
	},
	{
		id: "#5302004",
		product: "Goggles",
		color: "blue",
		qty: 5,
		date: "June 7, 2025",
		price: "$89.50",
		status: "Pending",
	},
	{
		id: "#5302005",
		product: "Jacket",
		color: "red",
		qty: 1,
		date: "June 10, 2025",
		price: "$120.75",
		status: "Delivered",
	},
	{
		id: "#5302006",
		product: "Pants",
		color: "green",
		qty: 4,
		date: "June 12, 2025",
		price: "$76.30",
		status: "Returned",
	},
];

const getStatusColor = (status) => {
	const colors = {
		Delivered: "bg-green-100 text-green-800",
		"In Transit": "bg-blue-100 text-blue-800",
		Pending: "bg-yellow-100 text-yellow-800",
		Returned: "bg-red-100 text-red-800",
		Cancelled: "bg-gray-100 text-gray-800",
	};
	return colors[status] || "bg-gray-100 text-gray-800";
};

const tableVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

const rowVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
};

export function OrderHistory() {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Orders History</CardTitle>
					<CardDescription>View and manage your order history</CardDescription>
				</div>
				<Button variant="outline" size="sm">
					<Download className="h-4 w-4 mr-2" />
					Export
				</Button>
			</CardHeader>
			<CardContent>
				<motion.div variants={tableVariants} initial="hidden" animate="visible">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Order ID</TableHead>
								<TableHead>Products</TableHead>
								<TableHead>Qty</TableHead>
								<TableHead>Order Date</TableHead>
								<TableHead>Price</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{orders.map((order, index) => (
								<motion.tr
									key={order.id}
									variants={rowVariants}
									className="hover:bg-muted/50 transition-colors"
								>
									<TableCell className="font-medium">{order.id}</TableCell>
									<TableCell>
										<div>
											<div className="font-medium">{order.product}</div>
											<div className="text-sm text-muted-foreground">
												{order.color}
											</div>
										</div>
									</TableCell>
									<TableCell>{order.qty}</TableCell>
									<TableCell>{order.date}</TableCell>
									<TableCell className="font-medium">{order.price}</TableCell>
									<TableCell>
										<Badge className={getStatusColor(order.status)}>
											{order.status}
										</Badge>
									</TableCell>
									<TableCell>
										<Button variant="ghost" size="sm">
											<Eye className="h-4 w-4" />
										</Button>
									</TableCell>
								</motion.tr>
							))}
						</TableBody>
					</Table>
				</motion.div>
			</CardContent>
		</Card>
	);
}
