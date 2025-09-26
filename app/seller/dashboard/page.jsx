"use client";

import { useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
	ArrowUpRight,
	ShoppingCart,
	IndianRupee,
	Package,
	Users,
	Loader2,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useSellerDashboardStore } from "@/store/sellerDashboardStore.js";

const ResponsiveContainer = dynamic(
	() => import("recharts").then((mod) => mod.ResponsiveContainer),
	{ ssr: false }
);
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), {
	ssr: false,
});
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), {
	ssr: false,
});
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), {
	ssr: false,
});
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), {
	ssr: false,
});
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), {
	ssr: false,
});

const statusColors = {
	pending: "bg-yellow-100 text-yellow-800",
	confirmed: "bg-blue-100 text-blue-800",
	processing: "bg-blue-100 text-blue-800",
	shipped: "bg-purple-100 text-purple-800",
	delivered: "bg-green-100 text-green-800",
	cancelled: "bg-red-100 text-red-800",
	returned: "bg-amber-100 text-amber-800",
};

export default function SellerDashboard() {
	const { stats, orderSummary, paymentSummary, recentOrders, loading, error } =
		useSellerDashboardStore(
			useShallow((state) => ({
				stats: state.stats,
				orderSummary: state.orderSummary,
				paymentSummary: state.paymentSummary,
				recentOrders: state.recentOrders,
				loading: state.loading,
				error: state.error,
			}))
		);
	const fetchDashboardData = useSellerDashboardStore(
		(state) => state.fetchDashboardData
	);

	useEffect(() => {
		fetchDashboardData();
	}, [fetchDashboardData]);

	const summaryCards = [
		{
			title: "Total Orders",
			value: stats.totalOrders,
			icon: ShoppingCart,
			accent: "text-blue-500 bg-blue-100",
		},
		{
			title: "Total Revenue",
			value: `₹${Number(stats.totalSales || 0).toLocaleString(undefined, {
				minimumFractionDigits: 2,
			})}`,
			icon: IndianRupee,
			accent: "text-emerald-500 bg-emerald-100",
		},
		{
			title: "Total Products",
			value: stats.totalProducts,
			icon: Package,
			accent: "text-orange-500 bg-orange-100",
		},
		{
			title: "Unique Customers",
			value: stats.totalCustomers,
			icon: Users,
			accent: "text-purple-500 bg-purple-100",
		},
	];

	return (
		<div className="space-y-6 p-6 bg-gray-100">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<motion.h1
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-3xl font-semibold"
					>
						Seller overview
					</motion.h1>
					<motion.p
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-muted-foreground"
					>
						Stay on top of your orders, revenue, and customer activity.
					</motion.p>
				</div>

				<Button asChild variant="outline" className="gap-2 bg-transparent">
					<Link href="/seller/orders">
						View all orders
						<ArrowUpRight className="h-4 w-4" />
					</Link>
				</Button>
			</div>

			{loading ? (
				<div className="flex h-72 items-center justify-center rounded-lg border bg-card">
					<div className="flex items-center gap-3 text-muted-foreground">
						<Loader2 className="h-5 w-5 animate-spin" />
						Loading dashboard data...
					</div>
				</div>
			) : error ? (
				<Card>
					<CardContent className="flex h-60 flex-col items-center justify-center gap-3">
						<p className="text-center text-sm text-red-600">{error}</p>
						<Button onClick={fetchDashboardData}>Retry</Button>
					</CardContent>
				</Card>
			) : (
				<>
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
						{summaryCards.map((card) => (
							<Card key={card.title}>
								<CardContent className="flex items-start justify-between p-6">
									<div>
										<p className="text-sm text-muted-foreground">
											{card.title}
										</p>
										<p className="mt-1 text-2xl font-semibold">{card.value}</p>
									</div>
									<div className={`rounded-full p-3 ${card.accent}`}>
										<card.icon className="h-6 w-6" />
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					<div className="grid gap-4 lg:grid-cols-3">
						<Card className="lg:col-span-2">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-lg font-semibold">
									Payment summary
								</CardTitle>
							</CardHeader>
							<CardContent className="h-[320px]">
								{paymentSummary.length ? (
									<ResponsiveContainer width="100%" height="100%">
										<BarChart data={paymentSummary}>
											<XAxis dataKey="label" stroke="#94a3b8" />
											<YAxis stroke="#94a3b8" />
											<Tooltip cursor={{ fill: "rgba(148, 163, 184, 0.15)" }} />
											<Bar
												dataKey="value"
												fill="#f97316"
												radius={[6, 6, 0, 0]}
												maxBarSize={32}
											/>
										</BarChart>
									</ResponsiveContainer>
								) : (
									<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
										Not enough data to display payment trends yet.
									</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-4">
								<CardTitle className="text-lg font-semibold">
									Order distribution
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-5">
								<SummaryProgress
									label="Pending orders"
									value={orderSummary.pendingPercent}
									tone="bg-yellow-500"
								/>
								<SummaryProgress
									label="Processing orders"
									value={orderSummary.processingPercent}
									tone="bg-blue-500"
								/>
								<SummaryProgress
									label="Shipped orders"
									value={orderSummary.shippedPercent}
									tone="bg-purple-500"
								/>
								<SummaryProgress
									label="Delivered orders"
									value={orderSummary.deliveredPercent}
									tone="bg-green-500"
								/>
								<SummaryProgress
									label="Cancelled orders"
									value={orderSummary.cancelledPercent}
									tone="bg-red-500"
								/>
							</CardContent>
						</Card>
					</div>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between pr-6">
							<CardTitle className="text-lg font-semibold">
								Recent orders
							</CardTitle>
							<Button
								asChild
								size="sm"
								variant="ghost"
								className="text-muted-foreground hover:text-primary"
							>
								<Link href="/seller/orders">See all</Link>
							</Button>
						</CardHeader>
						<CardContent className="px-0">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Order</TableHead>
										<TableHead>Customer</TableHead>
										<TableHead>Payment</TableHead>
										<TableHead>Items</TableHead>
										<TableHead>Total</TableHead>
										<TableHead>Status</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{recentOrders.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={6}
												className="py-8 text-center text-sm text-muted-foreground"
											>
												No recent orders yet.
											</TableCell>
										</TableRow>
									) : (
										recentOrders.map((order) => (
											<TableRow key={order.id}>
												<TableCell>
													<div className="flex flex-col">
														<span className="font-medium">
															{order.orderNumber}
														</span>
														<span className="text-xs text-muted-foreground">
															{order.createdAt
																? new Date(order.createdAt).toLocaleString()
																: "N/A"}
														</span>
													</div>
												</TableCell>
												<TableCell className="max-w-[180px] truncate">
													{order.customerName}
												</TableCell>
												<TableCell className="capitalize text-muted-foreground">
													{order.paymentMethod}
												</TableCell>
												<TableCell>{order.itemsCount}</TableCell>
												<TableCell className="font-semibold text-emerald-600">
													₹
													{Number(order.totalAmount || 0).toLocaleString(
														undefined,
														{ minimumFractionDigits: 2 }
													)}
												</TableCell>
												<TableCell>
													<Badge
														className={
															statusColors[order.status] ||
															"bg-slate-100 text-slate-800"
														}
													>
														{order.status?.replaceAll("_", " ") || "N/A"}
													</Badge>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}

function SummaryProgress({ label, value, tone }) {
	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between text-sm">
				<span className="text-muted-foreground">{label}</span>
				<span className="font-semibold">{value}%</span>
			</div>
			<Progress value={value} className="h-2" indicatorClassName={tone} />
		</div>
	);
}
