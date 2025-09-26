"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { RotateCcw } from "lucide-react";

import { useSellerOrderStore } from "@/store/sellerOrderStore";
import { useIsSellerAuthenticated } from "@/store/sellerAuthStore";

const STATUS_BADGES = {
	returned: "bg-amber-100 text-amber-800",
	processing: "bg-blue-100 text-blue-800",
	pending: "bg-yellow-100 text-yellow-800",
	cancelled: "bg-red-100 text-red-800",
};

export default function SellerReturnsPage() {
	const router = useRouter();
	const isAuthenticated = useIsSellerAuthenticated();

	const { returnOrders, returnsLoading, returnsError } = useSellerOrderStore(
		useShallow((state) => ({
			returnOrders: state.returnOrders,
			returnsLoading: state.returnsLoading,
			returnsError: state.returnsError,
		}))
	);
	const fetchReturnOrders = useSellerOrderStore(
		(state) => state.fetchReturnOrders
	);

	useEffect(() => {
		if (!isAuthenticated) {
			const timer = setTimeout(() => {
				router.push("/seller/login");
			}, 120);
			return () => clearTimeout(timer);
		}
	}, [isAuthenticated, router]);

	useEffect(() => {
		if (isAuthenticated) {
			fetchReturnOrders();
		}
	}, [isAuthenticated, fetchReturnOrders]);

	if (!isAuthenticated) {
		return (
			<div className="flex items-center justify-center py-8 px-6 bg-white">
				<div className="text-gray-600">Redirecting to login...</div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<h1 className="text-3xl font-bold text-gray-900">Return requests</h1>
				<p className="text-gray-600 mt-2">
					Monitor the status of customer returns and keep track of refund
					timelines.
				</p>
			</motion.div>

			<Card className="bg-white border-0 shadow-sm">
				<div className="p-6 border-b flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<div className="w-8 h-8 bg-orange-50 rounded flex items-center justify-center">
							<RotateCcw className="w-4 h-4 text-orange-600" />
						</div>
						<div>
							<h2 className="text-lg font-semibold text-gray-900">
								Returned sub-orders
							</h2>
							<p className="text-sm text-gray-500">
								All return requests submitted by buyers for your products.
							</p>
						</div>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={fetchReturnOrders}
						disabled={returnsLoading}
					>
						Refresh
					</Button>
				</div>

				<div className="overflow-x-auto">
					<Table>
						<TableHeader className="bg-gray-50">
							<TableRow>
								<TableHead>Return ID</TableHead>
								<TableHead>Order</TableHead>
								<TableHead>Products</TableHead>
								<TableHead>Quantity</TableHead>
								<TableHead>Total refund</TableHead>
								<TableHead>Customer</TableHead>
								<TableHead>Location</TableHead>
								<TableHead>Refund ETA</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{returnsLoading ? (
								<TableRow>
									<TableCell
										colSpan={9}
										className="py-10 text-center text-sm text-muted-foreground"
									>
										Loading return orders...
									</TableCell>
								</TableRow>
							) : returnsError ? (
								<TableRow>
									<TableCell
										colSpan={9}
										className="py-10 text-center text-sm text-red-600"
									>
										{returnsError}
									</TableCell>
								</TableRow>
							) : returnOrders?.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={9}
										className="py-10 text-center text-sm text-muted-foreground"
									>
										No returns recorded yet.
									</TableCell>
								</TableRow>
							) : (
								returnOrders?.map((order, index) => (
									<motion.tr
										key={order.id}
										initial={{ opacity: 0, y: 8 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.2, delay: index * 0.03 }}
										className="hover:bg-gray-50"
									>
										<TableCell className="font-medium">
											<div className="flex flex-col">
												<span>{order.subOrderCode}</span>
												<span className="text-xs text-muted-foreground">
													{order.orderNumber}
												</span>
											</div>
										</TableCell>
										<TableCell>
											{order.orderDate
												? new Date(order.orderDate).toLocaleDateString()
												: "—"}
											<br />
											<span className="text-xs text-gray-500">
												Updated{" "}
												{order.updatedAt
													? new Date(order.updatedAt).toLocaleDateString()
													: "—"}
											</span>
										</TableCell>
										<TableCell>
											<div className="space-y-2">
												{order.products.slice(0, 2).map((product, idx) => (
													<div
														key={`${order.id}-${idx}`}
														className="flex items-center gap-3"
													>
														<img
															src={
																product.image ||
																"/placeholder.svg?height=40&width=40&query=product"
															}
															alt={product.name}
															className="w-10 h-10 object-cover rounded"
														/>
														<div>
															<p className="font-medium text-sm">
																{product.name}
															</p>
															<p className="text-xs text-gray-500">
																Qty: {product.quantity}
															</p>
														</div>
													</div>
												))}
												{order.products.length > 2 && (
													<p className="text-xs text-gray-500">
														+{order.products.length - 2} more items
													</p>
												)}
											</div>
										</TableCell>
										<TableCell>{order.totalQuantity}</TableCell>
										<TableCell className="font-semibold text-emerald-600">
											₹
											{Number(order.totalAmount || 0).toLocaleString(
												undefined,
												{ minimumFractionDigits: 2 }
											)}
										</TableCell>
										<TableCell>
											<div className="flex flex-col">
												<span className="font-medium">
													{order.customer?.name || "Customer"}
												</span>
												<span className="text-xs text-gray-500">
													{order.customer?.email}
												</span>
											</div>
										</TableCell>
										<TableCell className="max-w-[180px] truncate">
											{order.location || "—"}
										</TableCell>
										<TableCell>
											{order.refundDeadline
												? new Date(order.refundDeadline).toLocaleDateString()
												: "—"}
										</TableCell>
										<TableCell>
											<Badge
												className={
													STATUS_BADGES[order.status] ||
													"bg-gray-100 text-gray-800"
												}
											>
												{order.status?.toUpperCase()}
											</Badge>
										</TableCell>
									</motion.tr>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</Card>
		</div>
	);
}
