"use client";

import { useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getOrderStatusLabel } from "@/constants/orderStatus.js";
import {
	ArrowUpRight,
	BarChart3,
	CalendarDays,
	Download,
	Filter,
	LineChart,
	ListFilter,
	RefreshCw,
	ShoppingBag,
	TrendingDown,
	TrendingUp,
	Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { useIsAuthenticated } from "@/store/adminAuthStore";
import { toast } from "react-hot-toast";
import {
	useAdminAnalyticsStore,
	useAdminAnalyticsFilters,
	useAdminAnalyticsData,
	useAdminAnalyticsLoading,
	useAdminAnalyticsError,
} from "@/store/adminAnalyticsStore";

const ResponsiveContainer = dynamic(
	() => import("recharts").then((mod) => mod.ResponsiveContainer),
	{ ssr: false }
);
const AreaChart = dynamic(
	() => import("recharts").then((mod) => mod.AreaChart),
	{
		ssr: false,
	}
);
const Area = dynamic(() => import("recharts").then((mod) => mod.Area), {
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
const CartesianGrid = dynamic(
	() => import("recharts").then((mod) => mod.CartesianGrid),
	{ ssr: false }
);

const summaryCards = (data) => [
	{
		title: "Total revenue",
		value: data.summary.totalRevenue,
		prefix: "₹",
		icon: LineChart,
		change: data.growth.revenue,
	},
	{
		title: "Total orders",
		value: data.summary.totalOrders,
		icon: ShoppingBag,
		change: data.growth.orders,
	},
	{
		title: "Units sold",
		value: data.summary.totalUnits,
		icon: BarChart3,
		change: data.growth.units,
	},
	{
		title: "Unique customers",
		value: data.summary.uniqueCustomers,
		icon: Users,
		hideTrend: true,
	},
];

const formatCurrency = (value) =>
	typeof value === "number"
		? value.toLocaleString(undefined, {
				style: "currency",
				currency: "INR",
				maximumFractionDigits: 0,
		  })
		: value;

const trendIndicator = (change) => {
	if (typeof change !== "number") {
		return <span className="text-sm text-muted-foreground">—</span>;
	}

	if (change > 0) {
		return (
			<span className="flex items-center text-sm font-medium text-emerald-600">
				<TrendingUp className="mr-1 h-4 w-4" />
				{change.toFixed(1)}%
			</span>
		);
	}

	if (change < 0) {
		return (
			<span className="flex items-center text-sm font-medium text-red-600">
				<TrendingDown className="mr-1 h-4 w-4" />
				{Math.abs(change).toFixed(1)}%
			</span>
		);
	}

	return <span className="text-sm text-muted-foreground">0%</span>;
};

const buildActiveFilterChips = (filters, analytics) => {
	const chips = [];
	if (filters.statuses.length) {
		chips.push(
			...filters.statuses.map((status) => ({
				label: `Status: ${status}`,
				type: "statuses",
				value: status,
			}))
		);
	}

	if (filters.paymentMethods.length) {
		chips.push(
			...filters.paymentMethods.map((method) => ({
				label: `Payment: ${method}`,
				type: "paymentMethods",
				value: method,
			}))
		);
	}

	if (filters.categories.length) {
		chips.push(
			...filters.categories.map((category) => ({
				label: `Category: ${category}`,
				type: "categories",
				value: category,
			}))
		);
	}

	if (filters.sellers.length) {
		const sellerMap = new Map(
			(analytics.availableFilters.sellers || []).map((seller) => [
				seller.value,
				seller.label,
			])
		);

		chips.push(
			...filters.sellers.map((sellerId) => ({
				label: `Seller: ${sellerMap.get(sellerId) || sellerId}`,
				type: "sellers",
				value: sellerId,
			}))
		);
	}

	return chips;
};

const useDownloadHandler = (getBlob, filename) =>
	useCallback(() => {
		const blob = getBlob();
		if (!blob) {
			toast.error("No data available for export");
			return;
		}

		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}, [getBlob, filename, toast]);

export default function AdminAnalytics() {
	const router = useRouter();
	const isAuthenticated = useIsAuthenticated();

	const filters = useAdminAnalyticsFilters();
	const analytics = useAdminAnalyticsData();
	const loading = useAdminAnalyticsLoading();
	const error = useAdminAnalyticsError();

	// console.log("Analytics data:", analytics);

	const fetchAnalytics = useAdminAnalyticsStore(
		(state) => state.fetchAnalytics
	);
	const setFilter = useAdminAnalyticsStore((state) => state.setFilter);
	const resetFilters = useAdminAnalyticsStore((state) => state.resetFilters);
	const exportOrdersReport = useAdminAnalyticsStore(
		(state) => state.exportOrdersReport
	);
	const exportSellerReport = useAdminAnalyticsStore(
		(state) => state.exportSellerReport
	);

	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/admin/login");
		}
	}, [isAuthenticated, router]);

	useEffect(() => {
		if (isAuthenticated) {
			fetchAnalytics();
		}
	}, [fetchAnalytics, isAuthenticated]);

	const activeFilters = useMemo(
		() => buildActiveFilterChips(filters, analytics),
		[filters, analytics]
	);

	const removeFilter = useCallback(
		(type, value) => {
			setFilter(
				type,
				filters[type].filter((item) => item !== value)
			);
		},
		[filters, setFilter]
	);

	const toggleMultiSelect = useCallback(
		(type, value) => {
			const current = new Set(filters[type]);
			if (current.has(value)) {
				current.delete(value);
			} else {
				current.add(value);
			}
			setFilter(type, Array.from(current));
		},
		[filters, setFilter]
	);

	const handleExportOrders = useDownloadHandler(
		exportOrdersReport,
		"orders-report.csv"
	);

	const handleExportSellers = useDownloadHandler(
		exportSellerReport,
		"seller-performance.csv"
	);

	const statusMax = useMemo(() => {
		if (!analytics.statusDistribution?.length) {
			return 1;
		}
		return Math.max(
			...analytics.statusDistribution.map((item) => item.count),
			1
		);
	}, [analytics.statusDistribution]);

	const totalCustomers = useMemo(() => {
		const total = analytics.customerSegments.totalCustomers || 0;
		return total > 0 ? total : 1;
	}, [analytics.customerSegments.totalCustomers]);

	if (!isAuthenticated) {
		return null;
	}

	return (
		<div className="space-y-6">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.25 }}
				className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
			>
				<div className="space-y-2">
					<h1 className="text-3xl font-bold text-gray-900">
						Analytics &amp; reports
					</h1>
					<p className="text-gray-600 max-w-2xl">
						Explore revenue trends, order performance, customer insights, and
						seller-level intelligence for the entire marketplace.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Button
						variant="outline"
						onClick={handleExportOrders}
						disabled={loading}
					>
						<Download className="mr-2 h-4 w-4" />
						Export orders
					</Button>
					<Button
						variant="outline"
						onClick={handleExportSellers}
						disabled={loading}
					>
						<Download className="mr-2 h-4 w-4" />
						Export sellers
					</Button>
					<Button
						onClick={() => fetchAnalytics()}
						disabled={loading}
						className="bg-orange-600 hover:bg-orange-700"
					>
						<RefreshCw
							className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
						/>
						Refresh
					</Button>
				</div>
			</motion.div>

			<Card>
				<CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div className="flex items-center gap-2 text-muted-foreground">
						<Filter className="h-4 w-4" />
						<span className="text-sm font-medium uppercase tracking-wide">
							Filters
						</span>
					</div>
					<div className="flex flex-wrap gap-2">
						<Button variant="ghost" size="sm" onClick={resetFilters}>
							Reset
						</Button>
						<Button
							size="sm"
							onClick={() => fetchAnalytics()}
							disabled={loading}
						>
							Apply changes
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						<div className="space-y-2">
							<label className="text-sm font-medium text-muted-foreground">
								Start date
							</label>
							<div className="relative">
								<CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									type="date"
									className="pl-10"
									value={filters.startDate}
									onChange={(event) =>
										setFilter("startDate", event.target.value)
									}
								/>
							</div>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium text-muted-foreground">
								End date
							</label>
							<div className="relative">
								<CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									type="date"
									className="pl-10"
									value={filters.endDate}
									onChange={(event) => setFilter("endDate", event.target.value)}
								/>
							</div>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium text-muted-foreground">
								Interval
							</label>
							<Select
								value={filters.interval}
								onValueChange={(value) => setFilter("interval", value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select interval" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="day">Daily</SelectItem>
									<SelectItem value="week">Weekly</SelectItem>
									<SelectItem value="month">Monthly</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" className="w-full justify-between">
									<span className="flex items-center gap-2">
										<ListFilter className="h-4 w-4" />
										Status
									</span>
									<ArrowUpRight className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56">
								<DropdownMenuLabel>Order status</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{(analytics.availableFilters.statuses || []).map((status) => (
									<DropdownMenuCheckboxItem
										key={status}
										checked={filters.statuses.includes(status)}
										onCheckedChange={() =>
											toggleMultiSelect("statuses", status)
										}
									>
										{status}
									</DropdownMenuCheckboxItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" className="w-full justify-between">
									<span className="flex items-center gap-2">
										<ListFilter className="h-4 w-4" />
										Payment methods
									</span>
									<ArrowUpRight className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-60">
								<DropdownMenuLabel>Payment methods</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{(analytics.availableFilters.paymentMethods || []).map(
									(method) => (
										<DropdownMenuCheckboxItem
											key={method}
											checked={filters.paymentMethods.includes(method)}
											onCheckedChange={() =>
												toggleMultiSelect("paymentMethods", method)
											}
										>
											{method}
										</DropdownMenuCheckboxItem>
									)
								)}
							</DropdownMenuContent>
						</DropdownMenu>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" className="w-full justify-between">
									<span className="flex items-center gap-2">
										<ListFilter className="h-4 w-4" />
										Categories
									</span>
									<ArrowUpRight className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-60">
								<DropdownMenuLabel>Categories</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{(analytics.availableFilters.categories || []).map(
									(category) => (
										<DropdownMenuCheckboxItem
											key={category}
											checked={filters.categories.includes(category)}
											onCheckedChange={() =>
												toggleMultiSelect("categories", category)
											}
										>
											{category}
										</DropdownMenuCheckboxItem>
									)
								)}
							</DropdownMenuContent>
						</DropdownMenu>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" className="w-full justify-between">
									<span className="flex items-center gap-2">
										<ListFilter className="h-4 w-4" />
										Sellers
									</span>
									<ArrowUpRight className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-64">
								<DropdownMenuLabel>Sellers</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{(analytics.availableFilters.sellers || []).map((seller) => (
									<DropdownMenuCheckboxItem
										key={seller.value}
										checked={filters.sellers.includes(seller.value)}
										onCheckedChange={() =>
											toggleMultiSelect("sellers", seller.value)
										}
									>
										<div className="flex flex-col">
											<span className="text-sm font-medium">
												{seller.label}
											</span>
											<span className="text-xs text-muted-foreground">
												{seller.status || ""}
											</span>
										</div>
									</DropdownMenuCheckboxItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					{activeFilters.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{activeFilters.map((chip) => (
								<Badge
									key={`${chip.type}-${chip.value}`}
									variant="secondary"
									className="flex items-center gap-1 cursor-pointer"
									onClick={() => removeFilter(chip.type, chip.value)}
								>
									{chip.label}
									<span className="text-xs">×</span>
								</Badge>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{error && (
				<Card className="border-red-200 bg-red-50">
					<CardContent className="py-6 text-red-700">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium">{error}</p>
								<p className="text-sm text-red-600/80">
									Try adjusting your filters or refresh the page.
								</p>
							</div>
							<Button onClick={() => fetchAnalytics()} size="sm">
								Retry
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				{summaryCards(analytics).map((card) => (
					<Card key={card.title}>
						<CardContent className="p-6">
							<div className="flex items-start justify-between">
								<div className="space-y-1">
									<p className="text-sm font-medium text-muted-foreground">
										{card.title}
									</p>
									<p className="text-2xl font-bold">
										{card.prefix
											? formatCurrency(card.value)
											: card.value?.toLocaleString?.() ?? card.value}
									</p>
								</div>
								<card.icon className="h-8 w-8 text-orange-500" />
							</div>
							{!card.hideTrend && (
								<div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
									<span>vs previous period</span>
									{trendIndicator(card.change)}
								</div>
							)}
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
				<Card className="xl:col-span-2">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<LineChart className="h-5 w-5 text-orange-500" />
							Orders &amp; revenue over time
						</CardTitle>
					</CardHeader>
					<CardContent className="h-[320px]">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={analytics.ordersOverTime}>
								<defs>
									<linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
										<stop offset="95%" stopColor="#f97316" stopOpacity={0} />
									</linearGradient>
									<linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
										<stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" opacity={0.2} />
								<XAxis dataKey="label" tickLine={false} axisLine={false} />
								<YAxis tickLine={false} axisLine={false} />
								<Tooltip
									formatter={(value, key) => {
										if (key === "revenue") {
											return [formatCurrency(value), "Revenue"];
										}
										if (key === "orders") {
											return [value, "Orders"];
										}
										if (key === "units") {
											return [value, "Units"];
										}
										return [value, key];
									}}
								/>
								<Area
									type="monotone"
									dataKey="revenue"
									stroke="#f97316"
									fill="url(#colorRevenue)"
									strokeWidth={2}
								/>
								<Area
									type="monotone"
									dataKey="orders"
									stroke="#6366f1"
									fill="url(#colorOrders)"
									strokeWidth={2}
								/>
							</AreaChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<BarChart3 className="h-5 w-5 text-sky-500" />
								Status distribution
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{(analytics.statusDistribution || []).map((item) => (
								<div
									key={item.status}
									className="space-y-1 rounded-lg border border-gray-100 p-3"
								>
									<div className="flex items-center justify-between text-sm font-medium">
										<span className="capitalize">{item.status}</span>
										<span>{item.count.toLocaleString()}</span>
									</div>
									<Progress value={(item.count / statusMax) * 100} />
									<p className="text-xs text-muted-foreground">
										{formatCurrency(item.revenue)} revenue
									</p>
								</div>
							))}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<ShoppingBag className="h-5 w-5 text-emerald-500" />
								Payment mix
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{(analytics.paymentMethods || []).map((item) => (
								<div
									key={item.method}
									className="flex items-center justify-between"
								>
									<div>
										<p className="font-medium capitalize">{item.method}</p>
										<p className="text-xs text-muted-foreground">
											{item.count.toLocaleString()} orders
										</p>
									</div>
									<span className="text-sm font-semibold">
										{formatCurrency(item.revenue)}
									</span>
								</div>
							))}
						</CardContent>
					</Card>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5 text-purple-500" />
						Seller performance snapshot
					</CardTitle>
				</CardHeader>
				<CardContent className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Seller</TableHead>
								<TableHead>Revenue</TableHead>
								<TableHead>Orders</TableHead>
								<TableHead>Units</TableHead>
								<TableHead>AOV</TableHead>
								<TableHead>Status mix</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{(analytics.sellerPerformance || []).map((seller) => (
								<TableRow key={seller.sellerId}>
									<TableCell>
										<div className="flex flex-col">
											<span className="font-medium">{seller.displayName}</span>
											<span className="text-xs text-muted-foreground">
												{seller.email || seller.phone}
											</span>
											<span className="text-xs text-muted-foreground">
												{seller.brandName || seller.companyName}
											</span>
										</div>
									</TableCell>
									<TableCell>{formatCurrency(seller.totalRevenue)}</TableCell>
									<TableCell>{seller.totalOrders.toLocaleString()}</TableCell>
									<TableCell>{seller.totalUnits.toLocaleString()}</TableCell>
									<TableCell>
										{formatCurrency(seller.averageOrderValue)}
									</TableCell>
									<TableCell>
										<div className="flex flex-wrap gap-1">
											{(seller.statusBreakdown || []).map((status) => (
												<Badge
													key={`${seller.sellerId}-${status.status}`}
													variant="outline"
												>
													{status.status} · {status.orders}
												</Badge>
											))}
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					{!(analytics.sellerPerformance || []).length && (
						<p className="py-6 text-center text-sm text-muted-foreground">
							No seller activity in the selected period.
						</p>
					)}
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BarChart3 className="h-5 w-5 text-indigo-500" />
							Category performance
						</CardTitle>
					</CardHeader>
					<CardContent className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Category</TableHead>
									<TableHead>Revenue</TableHead>
									<TableHead>Units</TableHead>
									<TableHead>Orders</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{(analytics.categoryPerformance || []).map((category) => (
									<TableRow key={category.category}>
										<TableCell className="font-medium">
											{category.category}
										</TableCell>
										<TableCell>
											{formatCurrency(category.totalRevenue)}
										</TableCell>
										<TableCell>
											{category.totalUnits.toLocaleString()}
										</TableCell>
										<TableCell>
											{category.orderCount.toLocaleString()}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						{!(analytics.categoryPerformance || []).length && (
							<p className="py-6 text-center text-sm text-muted-foreground">
								No category insights for this period.
							</p>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<LineChart className="h-5 w-5 text-rose-500" />
							Customer insights
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-muted-foreground">Total customers</p>
								<p className="text-2xl font-semibold">
									{analytics.customerSegments.totalCustomers.toLocaleString()}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Returning</p>
								<p className="text-2xl font-semibold">
									{analytics.customerSegments.returningCustomers.toLocaleString()}
								</p>
							</div>
						</div>
						<div className="space-y-3">
							<div>
								<div className="flex items-center justify-between text-sm">
									<span>Repeat customers</span>
									<span>
										{analytics.customerSegments.repeatCustomers.toLocaleString()}
									</span>
								</div>
								<Progress
									value={
										(analytics.customerSegments.repeatCustomers /
											totalCustomers) *
										100
									}
								/>
							</div>
							<div>
								<div className="flex items-center justify-between text-sm">
									<span>New this period</span>
									<span>
										{analytics.customerSegments.newCustomers.toLocaleString()}
									</span>
								</div>
								<Progress
									value={
										(analytics.customerSegments.newCustomers / totalCustomers) *
										100
									}
									className="bg-emerald-100"
								/>
							</div>
						</div>
						<div className="rounded-lg border border-gray-100 p-3 text-sm">
							<div className="flex items-center justify-between">
								<span>Avg. order frequency</span>
								<span className="font-medium">
									{analytics.customerSegments.avgOrderFrequency?.toFixed?.(1) ||
										0}
									×
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span>Customer lifetime value</span>
								<span className="font-medium">
									{formatCurrency(
										analytics.customerSegments.customerLifetimeValue
									)}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ShoppingBag className="h-5 w-5 text-amber-500" />
							Top products
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{(analytics.topProducts || []).map((product) => (
							<div
								key={product.productId || product.productName}
								className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
							>
								<div>
									<p className="font-medium">{product.productName}</p>
									<p className="text-xs text-muted-foreground">
										{product.totalUnits.toLocaleString()} units
									</p>
								</div>
								<span className="text-sm font-semibold">
									{formatCurrency(product.totalRevenue)}
								</span>
							</div>
						))}
						{!(analytics.topProducts || []).length && (
							<p className="py-4 text-center text-sm text-muted-foreground">
								No product sales in this range.
							</p>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5 text-blue-500" />
							Top customers
						</CardTitle>
					</CardHeader>
					<CardContent className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Customer</TableHead>
									<TableHead>Orders</TableHead>
									<TableHead>Units</TableHead>
									<TableHead>Revenue</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{(analytics.reports.customers || []).map((customer) => (
									<TableRow key={customer.customerId}>
										<TableCell>
											<div className="flex flex-col">
												<span className="font-medium">
													{[customer.firstName, customer.lastName]
														.filter(Boolean)
														.join(" ") ||
														customer.email ||
														customer.phone ||
														customer.customerId}
												</span>
												<span className="text-xs text-muted-foreground">
													{customer.email || customer.phone || ""}
												</span>
											</div>
										</TableCell>
										<TableCell>{customer.orders}</TableCell>
										<TableCell>{customer.units}</TableCell>
										<TableCell>
											{formatCurrency(customer.totalRevenue)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						{!(analytics.reports.customers || []).length && (
							<p className="py-4 text-center text-sm text-muted-foreground">
								No customer activity in this range.
							</p>
						)}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
					<CardTitle className="flex items-center gap-2">
						<ListFilter className="h-5 w-5 text-slate-600" />
						Orders report
					</CardTitle>
					<Button
						variant="outline"
						size="sm"
						onClick={handleExportOrders}
						disabled={loading}
					>
						<Download className="mr-2 h-4 w-4" />
						Download CSV
					</Button>
				</CardHeader>
				<CardContent className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Order</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Payment</TableHead>
								<TableHead>Units</TableHead>
								<TableHead>Total</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{(analytics.reports.orders || []).map((order) => (
								<TableRow key={order.id}>
									<TableCell className="font-medium">
										{order.orderNumber}
									</TableCell>
									<TableCell>
										{order.orderDate
											? new Date(order.orderDate).toLocaleString()
											: "-"}
									</TableCell>
                                                                        <TableCell className="capitalize">
                                                                                {order.hexalogStatus || getOrderStatusLabel(order.status)}
                                                                        </TableCell>
									<TableCell className="capitalize">
										{order.paymentMethod}
									</TableCell>
									<TableCell>{order.units}</TableCell>
									<TableCell>{formatCurrency(order.totalAmount)}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					{!(analytics.reports.orders || []).length && (
						<p className="py-6 text-center text-sm text-muted-foreground">
							No orders found for the selected filters.
						</p>
					)}
				</CardContent>
			</Card>

			{loading && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
					<div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-lg">
						<RefreshCw className="h-4 w-4 animate-spin text-orange-600" />
						<span className="text-sm font-medium text-gray-600">
							Updating insights...
						</span>
					</div>
				</div>
			)}
		</div>
	);
}
