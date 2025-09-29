"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
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
import { useShallow } from "zustand/react/shallow";

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
import { useSellerAnalyticsStore } from "@/store/sellerAnalyticsStore";
import { useIsSellerAuthenticated } from "@/store/sellerAuthStore";

const ResponsiveContainer = dynamic(
        () => import("recharts").then((mod) => mod.ResponsiveContainer),
        { ssr: false }
);
const AreaChart = dynamic(() => import("recharts").then((mod) => mod.AreaChart), {
        ssr: false,
});
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
                change: data.customerSegments.returningCustomers,
                changeLabel: "returning",
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

export default function SellerAnalyticsPage() {
        const router = useRouter();
        const isAuthenticated = useIsSellerAuthenticated();

        const { filters, analytics, loading, error } = useSellerAnalyticsStore(
                useShallow((state) => ({
                        filters: state.filters,
                        analytics: state.analytics,
                        loading: state.loading,
                        error: state.error,
                }))
        );

        const fetchAnalytics = useSellerAnalyticsStore((state) => state.fetchAnalytics);
        const setFilter = useSellerAnalyticsStore((state) => state.setFilter);
        const resetFilters = useSellerAnalyticsStore((state) => state.resetFilters);
        const exportOrdersReport = useSellerAnalyticsStore(
                (state) => state.exportOrdersReport
        );

        useEffect(() => {
                if (!isAuthenticated) {
                        router.push("/seller/login");
                }
        }, [isAuthenticated, router]);

        useEffect(() => {
                if (isAuthenticated) {
                        fetchAnalytics();
                }
        }, [fetchAnalytics, isAuthenticated]);

        const activeFilters = useMemo(() => {
                const chips = [];
                if (filters.statuses.length) {
                        chips.push(...filters.statuses.map((status) => ({
                                label: `Status: ${status}`,
                                type: "statuses",
                                value: status,
                        })));
                }
                if (filters.paymentMethods.length) {
                        chips.push(...filters.paymentMethods.map((method) => ({
                                label: `Payment: ${method}`,
                                type: "paymentMethods",
                                value: method,
                        })));
                }
                if (filters.categories.length) {
                        chips.push(...filters.categories.map((category) => ({
                                label: `Category: ${category}`,
                                type: "categories",
                                value: category,
                        })));
                }
                return chips;
        }, [filters.categories, filters.paymentMethods, filters.statuses]);

        const removeFilter = useCallback(
                (type, value) => {
                        setFilter(type, filters[type].filter((item) => item !== value));
                },
                [filters, setFilter]
        );

        const handleExport = useCallback(() => {
                const blob = exportOrdersReport();
                if (!blob) return;

                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `seller-analytics-report-${filters.startDate}-to-${filters.endDate}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
        }, [exportOrdersReport, filters.endDate, filters.startDate]);

        const hasTimelineData = analytics.ordersOverTime.length > 0;

        const ordersTable = useMemo(
                () => analytics?.reports?.orders ?? [],
                [analytics.reports]
        );

        return (
                <div className="space-y-6 p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="space-y-2">
                                        <motion.h1
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-3xl font-semibold"
                                        >
                                                Analytics & reports
                                        </motion.h1>
                                        <motion.p
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-sm text-muted-foreground"
                                        >
                                                Track performance, uncover insights, and drill into the health of
                                                your business with marketplace-grade filtering.
                                        </motion.p>
                                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                        <CalendarDays className="h-4 w-4" />
                                                        <span>
                                                                {filters.startDate} → {filters.endDate}
                                                        </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                        <Filter className="h-4 w-4" />
                                                        <span>
                                                                Interval: {filters.interval}
                                                        </span>
                                                </div>
                                        </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                        <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2"
                                                onClick={() => fetchAnalytics()}
                                                disabled={loading}
                                        >
                                                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                                                Refresh
                                        </Button>
                                        <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2"
                                                onClick={handleExport}
                                                disabled={!ordersTable.length}
                                        >
                                                <Download className="h-4 w-4" />
                                                Export CSV
                                        </Button>
                                </div>
                        </div>

                        <Card>
                                <CardHeader className="flex flex-col gap-4 border-b sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                                <ListFilter className="h-4 w-4" />
                                                Advanced filters
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                                <div className="flex items-center gap-2">
                                                        <div className="text-xs font-medium text-muted-foreground">
                                                                From
                                                        </div>
                                                        <Input
                                                                type="date"
                                                                value={filters.startDate}
                                                                onChange={(event) =>
                                                                        setFilter("startDate", event.target.value)
                                                                }
                                                                className="h-9 w-36"
                                                        />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                        <div className="text-xs font-medium text-muted-foreground">
                                                                To
                                                        </div>
                                                        <Input
                                                                type="date"
                                                                value={filters.endDate}
                                                                onChange={(event) =>
                                                                        setFilter("endDate", event.target.value)
                                                                }
                                                                className="h-9 w-36"
                                                        />
                                                </div>
                                                <Select
                                                        value={filters.interval}
                                                        onValueChange={(value) => setFilter("interval", value)}
                                                >
                                                        <SelectTrigger className="h-9 w-36">
                                                                <SelectValue placeholder="Interval" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                                <SelectItem value="day">Daily</SelectItem>
                                                                <SelectItem value="week">Weekly</SelectItem>
                                                                <SelectItem value="month">Monthly</SelectItem>
                                                        </SelectContent>
                                                </Select>

                                                <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                                <Button variant="outline" size="sm" className="gap-2">
                                                                        Status
                                                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                                                </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-56">
                                                                <DropdownMenuLabel>Order status</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                {analytics.availableFilters.statuses.length ? (
                                                                        analytics.availableFilters.statuses.map((status) => (
                                                                                <DropdownMenuCheckboxItem
                                                                                        key={status}
                                                                                        checked={filters.statuses.includes(status)}
                                                                                        onCheckedChange={(checked) => {
                                                                                                if (checked) {
                                                                                                        setFilter("statuses", [
                                                                                                                ...filters.statuses,
                                                                                                                status,
                                                                                                        ]);
                                                                                                } else {
                                                                                                        setFilter(
                                                                                                                "statuses",
                                                                                                                filters.statuses.filter(
                                                                                                                        (item) => item !== status
                                                                                                                )
                                                                                                        );
                                                                                                }
                                                                                        }}
                                                                                >
                                                                                        {status}
                                                                                </DropdownMenuCheckboxItem>
                                                                        ))
                                                                ) : (
                                                                        <div className="px-2 py-1 text-xs text-muted-foreground">
                                                                                No status data yet.
                                                                        </div>
                                                                )}
                                                        </DropdownMenuContent>
                                                </DropdownMenu>

                                                <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                                <Button variant="outline" size="sm" className="gap-2">
                                                                        Payment
                                                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                                                </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-56">
                                                                <DropdownMenuLabel>Payment methods</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                {analytics.availableFilters.paymentMethods.length ? (
                                                                        analytics.availableFilters.paymentMethods.map(
                                                                                (method) => (
                                                                                        <DropdownMenuCheckboxItem
                                                                                                key={method}
                                                                                                checked={filters.paymentMethods.includes(method)}
                                                                                                onCheckedChange={(checked) => {
                                                                                                        if (checked) {
                                                                                                                setFilter("paymentMethods", [
                                                                                                                        ...filters.paymentMethods,
                                                                                                                        method,
                                                                                                                ]);
                                                                                                        } else {
                                                                                                                setFilter(
                                                                                                                        "paymentMethods",
                                                                                                                        filters.paymentMethods.filter(
                                                                                                                                (item) => item !== method
                                                                                                                        )
                                                                                                                );
                                                                                                        }
                                                                                                }}
                                                                                        >
                                                                                                {method}
                                                                                        </DropdownMenuCheckboxItem>
                                                                                )
                                                                        )
                                                                ) : (
                                                                        <div className="px-2 py-1 text-xs text-muted-foreground">
                                                                                No payment data yet.
                                                                        </div>
                                                                )}
                                                        </DropdownMenuContent>
                                                </DropdownMenu>

                                                <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                                <Button variant="outline" size="sm" className="gap-2">
                                                                        Categories
                                                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                                                </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-64">
                                                                <DropdownMenuLabel>Product categories</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                {analytics.availableFilters.categories.length ? (
                                                                        analytics.availableFilters.categories.map(
                                                                                (category) => (
                                                                                        <DropdownMenuCheckboxItem
                                                                                                key={category}
                                                                                                checked={filters.categories.includes(category)}
                                                                                                onCheckedChange={(checked) => {
                                                                                                        if (checked) {
                                                                                                                setFilter("categories", [
                                                                                                                        ...filters.categories,
                                                                                                                        category,
                                                                                                                ]);
                                                                                                        } else {
                                                                                                                setFilter(
                                                                                                                        "categories",
                                                                                                                        filters.categories.filter(
                                                                                                                                (item) => item !== category
                                                                                                                        )
                                                                                                                );
                                                                                                        }
                                                                                                }}
                                                                                        >
                                                                                                {category}
                                                                                        </DropdownMenuCheckboxItem>
                                                                                )
                                                                        )
                                                                ) : (
                                                                        <div className="px-2 py-1 text-xs text-muted-foreground">
                                                                                No category data yet.
                                                                        </div>
                                                                )}
                                                        </DropdownMenuContent>
                                                </DropdownMenu>

                                                <Button variant="outline" size="sm" onClick={() => resetFilters()}>
                                                        Clear filters
                                                </Button>
                                                <Button size="sm" onClick={() => fetchAnalytics()} disabled={loading}>
                                                        Apply
                                                </Button>
                                        </div>
                                </CardHeader>
                                {activeFilters.length ? (
                                        <CardContent className="flex flex-wrap gap-2 border-t bg-muted/30">
                                                {activeFilters.map((filterChip) => (
                                                        <Badge
                                                                key={`${filterChip.type}-${filterChip.value}`}
                                                                variant="secondary"
                                                                className="flex items-center gap-2"
                                                        >
                                                                {filterChip.label}
                                                                <button
                                                                        type="button"
                                                                        className="text-xs text-muted-foreground hover:text-foreground"
                                                                        onClick={() => removeFilter(filterChip.type, filterChip.value)}
                                                                >
                                                                        ×
                                                                </button>
                                                        </Badge>
                                                ))}
                                        </CardContent>
                                ) : null}
                        </Card>

                        {loading ? (
                                <Card>
                                        <CardContent className="flex h-64 items-center justify-center text-muted-foreground">
                                                Loading analytics...
                                        </CardContent>
                                </Card>
                        ) : error ? (
                                <Card>
                                        <CardContent className="flex h-64 flex-col items-center justify-center gap-3 text-center">
                                                <p className="text-sm text-red-600">{error}</p>
                                                <Button onClick={() => fetchAnalytics()}>Retry</Button>
                                        </CardContent>
                                </Card>
                        ) : (
                                <>
                                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                                {summaryCards(analytics).map((card) => (
                                                        <Card key={card.title}>
                                                                <CardContent className="flex flex-col gap-3 p-6">
                                                                        <div className="flex items-center justify-between">
                                                                                <div className="text-sm text-muted-foreground">
                                                                                        {card.title}
                                                                                </div>
                                                                                <div className="rounded-full bg-orange-100 p-2 text-orange-600">
                                                                                        <card.icon className="h-4 w-4" />
                                                                                </div>
                                                                        </div>
                                                                        <div className="text-2xl font-semibold">
                                                                                {card.prefix
                                                                                        ? `${card.prefix}${Number(card.value || 0).toLocaleString()}`
                                                                                        : Number(card.value || 0).toLocaleString()}
                                                                        </div>
                                                                        {!card.hideTrend ? (
                                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                                        {trendIndicator(card.change)}
                                                                                        <span>vs previous period</span>
                                                                                </div>
                                                                        ) : (
                                                                                <div className="text-xs text-muted-foreground">
                                                                                        {card.value
                                                                                                ? `${card.change || 0} returning`
                                                                                                : "No returning customers"}
                                                                                </div>
                                                                        )}
                                                                </CardContent>
                                                        </Card>
                                                ))}
                                        </div>

                                        <div className="grid gap-4 lg:grid-cols-3">
                                                <Card className="lg:col-span-2">
                                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                                <CardTitle className="text-lg font-semibold">
                                                                        Orders & revenue trend
                                                                </CardTitle>
                                                                <Badge variant="outline">{filters.interval}</Badge>
                                                        </CardHeader>
                                                        <CardContent className="h-[320px]">
                                                                {hasTimelineData ? (
                                                                        <ResponsiveContainer width="100%" height="100%">
                                                                                <AreaChart data={analytics.ordersOverTime}>
                                                                                        <defs>
                                                                                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                                                                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                                                                                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                                                                                </linearGradient>
                                                                                        </defs>
                                                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                                                        <XAxis dataKey="label" stroke="#94a3b8" />
                                                                                        <YAxis stroke="#94a3b8" tickFormatter={(value) => `${value}`} />
                                                                                        <Tooltip
                                                                                                contentStyle={{
                                                                                                        borderRadius: "0.5rem",
                                                                                                        borderColor: "#e2e8f0",
                                                                                                        fontSize: "0.75rem",
                                                                                                }}
                                                                                        />
                                                                                        <Area
                                                                                                type="monotone"
                                                                                                dataKey="revenue"
                                                                                                stroke="#f97316"
                                                                                                fill="url(#revenueGradient)"
                                                                                                strokeWidth={2}
                                                                                                name="Revenue"
                                                                                        />
                                                                                        <Area
                                                                                                type="monotone"
                                                                                                dataKey="orders"
                                                                                                stroke="#10b981"
                                                                                                fill="#10b98122"
                                                                                                strokeWidth={2}
                                                                                                name="Orders"
                                                                                        />
                                                                                </AreaChart>
                                                                        </ResponsiveContainer>
                                                                ) : (
                                                                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                                                                Not enough data to plot the trend yet.
                                                                        </div>
                                                                )}
                                                        </CardContent>
                                                </Card>

                                                <Card>
                                                        <CardHeader className="space-y-1">
                                                                <CardTitle className="text-lg font-semibold">
                                                                        Status distribution
                                                                </CardTitle>
                                                                <p className="text-sm text-muted-foreground">
                                                                        Understand how orders are moving across the fulfilment pipeline.
                                                                </p>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4">
                                                                {analytics.statusDistribution.length ? (
                                                                        analytics.statusDistribution.map((item) => {
                                                                                const total = analytics.summary.totalOrders || 1;
                                                                                const percent = Math.round(
                                                                                        (item.count / total) * 100
                                                                                );
                                                                                return (
                                                                                        <div key={item.status} className="space-y-2">
                                                                                                <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                                                                                                        <span className="capitalize">{item.status}</span>
                                                                                                        <span>{percent}%</span>
                                                                                                </div>
                                                                                                <Progress value={percent} className="h-2" />
                                                                                        </div>
                                                                                );
                                                                        })
                                                                ) : (
                                                                        <div className="text-sm text-muted-foreground">
                                                                                No order distribution available for the selected filters.
                                                                        </div>
                                                                )}
                                                        </CardContent>
                                                </Card>
                                        </div>

                                        <div className="grid gap-4 lg:grid-cols-2">
                                                <Card>
                                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                                <CardTitle className="text-lg font-semibold">
                                                                        Top performing products
                                                                </CardTitle>
                                                                <Badge variant="outline">
                                                                        {analytics.topProducts.length} SKUs
                                                                </Badge>
                                                        </CardHeader>
                                                        <CardContent className="overflow-hidden">
                                                                {analytics.topProducts.length ? (
                                                                        <div className="space-y-4">
                                                                                {analytics.topProducts.map((product) => (
                                                                                        <div key={product.productId || product.productName} className="space-y-1">
                                                                                                <div className="flex items-center justify-between text-sm font-medium">
                                                                                                        <span className="truncate text-sm text-foreground">
                                                                                                                {product.productName}
                                                                                                        </span>
                                                                                                        <span className="text-sm text-muted-foreground">
                                                                                                                {formatCurrency(product.totalRevenue)}
                                                                                                        </span>
                                                                                                </div>
                                                                                                <div className="text-xs text-muted-foreground">
                                                                                                        {product.totalUnits} units sold
                                                                                                </div>
                                                                                        </div>
                                                                                ))}
                                                                        </div>
                                                                ) : (
                                                                        <div className="text-sm text-muted-foreground">
                                                                                Add products or widen your filters to see product level insights.
                                                                        </div>
                                                                )}
                                                        </CardContent>
                                                </Card>

                                                <Card>
                                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                                <CardTitle className="text-lg font-semibold">
                                                                        Category performance
                                                                </CardTitle>
                                                                <Badge variant="outline">
                                                                        {analytics.categoryPerformance.length} categories
                                                                </Badge>
                                                        </CardHeader>
                                                        <CardContent className="overflow-auto">
                                                                {analytics.categoryPerformance.length ? (
                                                                        <Table>
                                                                                <TableHeader>
                                                                                        <TableRow>
                                                                                                <TableHead>Category</TableHead>
                                                                                                <TableHead className="text-right">
                                                                                                        Orders
                                                                                                </TableHead>
                                                                                                <TableHead className="text-right">
                                                                                                        Units
                                                                                                </TableHead>
                                                                                                <TableHead className="text-right">
                                                                                                        Revenue
                                                                                                </TableHead>
                                                                                        </TableRow>
                                                                                </TableHeader>
                                                                                <TableBody>
                                                                                        {analytics.categoryPerformance.map((category) => (
                                                                                                <TableRow key={category.category}>
                                                                                                        <TableCell className="font-medium">
                                                                                                                {category.category}
                                                                                                        </TableCell>
                                                                                                        <TableCell className="text-right">
                                                                                                                {category.orderCount}
                                                                                                        </TableCell>
                                                                                                        <TableCell className="text-right">
                                                                                                                {category.totalUnits}
                                                                                                        </TableCell>
                                                                                                        <TableCell className="text-right">
                                                                                                                {formatCurrency(category.totalRevenue)}
                                                                                                        </TableCell>
                                                                                                </TableRow>
                                                                                        ))}
                                                                                </TableBody>
                                                                        </Table>
                                                                ) : (
                                                                        <div className="text-sm text-muted-foreground">
                                                                                No category data available for the selected filters.
                                                                        </div>
                                                                )}
                                                        </CardContent>
                                                </Card>
                                        </div>

                                        <div className="grid gap-4 lg:grid-cols-3">
                                                <Card className="lg:col-span-2">
                                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                                <CardTitle className="text-lg font-semibold">
                                                                        Customer behaviour
                                                                </CardTitle>
                                                                <Badge variant="outline">
                                                                        {analytics.customerSegments.totalCustomers} customers
                                                                </Badge>
                                                        </CardHeader>
                                                        <CardContent className="grid gap-4 sm:grid-cols-2">
                                                                <div className="rounded-lg border bg-muted/20 p-4">
                                                                        <div className="text-sm text-muted-foreground">New customers</div>
                                                                        <div className="mt-2 text-2xl font-semibold">
                                                                                {analytics.customerSegments.newCustomers}
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                                Joined within the selected period
                                                                        </div>
                                                                </div>
                                                                <div className="rounded-lg border bg-muted/20 p-4">
                                                                        <div className="text-sm text-muted-foreground">
                                                                                Returning customers
                                                                        </div>
                                                                        <div className="mt-2 text-2xl font-semibold">
                                                                                {analytics.customerSegments.returningCustomers}
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                                Made more than one purchase
                                                                        </div>
                                                                </div>
                                                                <div className="rounded-lg border bg-muted/20 p-4">
                                                                        <div className="text-sm text-muted-foreground">
                                                                                Avg. order frequency
                                                                        </div>
                                                                        <div className="mt-2 text-2xl font-semibold">
                                                                                {analytics.customerSegments.avgOrderFrequency?.toFixed(1) || 0}
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                                Orders per customer in this period
                                                                        </div>
                                                                </div>
                                                                <div className="rounded-lg border bg-muted/20 p-4">
                                                                        <div className="text-sm text-muted-foreground">
                                                                                Avg. customer value
                                                                        </div>
                                                                        <div className="mt-2 text-2xl font-semibold">
                                                                                {formatCurrency(
                                                                                        analytics.customerSegments
                                                                                                .customerLifetimeValue || 0
                                                                                )}
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                                Average revenue generated per customer
                                                                        </div>
                                                                </div>
                                                        </CardContent>
                                                </Card>

                                                <Card>
                                                        <CardHeader className="space-y-1">
                                                                <CardTitle className="text-lg font-semibold">
                                                                        Payment mix
                                                                </CardTitle>
                                                                <p className="text-sm text-muted-foreground">
                                                                        Analyse which payment preferences are driving conversions.
                                                                </p>
                                                        </CardHeader>
                                                        <CardContent className="space-y-3">
                                                                {analytics.paymentMethods.length ? (
                                                                        analytics.paymentMethods.map((method) => {
                                                                                const share = analytics.summary.totalRevenue
                                                                                        ? (method.revenue /
                                                                                                analytics.summary.totalRevenue) *
                                                                                          100
                                                                                        : 0;
                                                                                return (
                                                                                        <div key={method.paymentMethod} className="space-y-1">
                                                                                                <div className="flex items-center justify-between text-sm">
                                                                                                        <span className="capitalize text-muted-foreground">
                                                                                                                {method.paymentMethod}
                                                                                                        </span>
                                                                                                        <span className="text-xs text-muted-foreground">
                                                                                                                {formatCurrency(method.revenue)}
                                                                                                        </span>
                                                                                                </div>
                                                                                                <Progress value={Math.round(share)} className="h-2" />
                                                                                        </div>
                                                                                );
                                                                        })
                                                                ) : (
                                                                        <div className="text-sm text-muted-foreground">
                                                                                No payment data for this selection.
                                                                        </div>
                                                                )}
                                                        </CardContent>
                                                </Card>
                                        </div>

                                        <Card>
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                                        <div>
                                                                <CardTitle className="text-lg font-semibold">
                                                                        Order-level report
                                                                </CardTitle>
                                                                <p className="text-sm text-muted-foreground">
                                                                        Detailed view of up to 100 most recent orders for the filters
                                                                        you have applied.
                                                                </p>
                                                        </div>
                                                        <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="gap-2"
                                                                onClick={handleExport}
                                                                disabled={!ordersTable.length}
                                                        >
                                                                <Download className="h-4 w-4" />
                                                                Export CSV
                                                        </Button>
                                                </CardHeader>
                                                <CardContent className="overflow-auto">
                                                        {ordersTable.length ? (
                                                                <Table>
                                                                        <TableHeader>
                                                                                <TableRow>
                                                                                        <TableHead>Order #</TableHead>
                                                                                        <TableHead>Date</TableHead>
                                                                                        <TableHead>Status</TableHead>
                                                                                        <TableHead>Payment</TableHead>
                                                                                        <TableHead className="text-right">Units</TableHead>
                                                                                        <TableHead className="text-right">Amount</TableHead>
                                                                                </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                                {ordersTable.map((order) => (
                                                                                        <TableRow key={order.id}>
                                                                                                <TableCell className="font-medium">
                                                                                                        {order.orderNumber}
                                                                                                </TableCell>
                                                                                                <TableCell>
                                                                                                        {new Date(order.orderDate).toLocaleString()}
                                                                                                </TableCell>
                                                                                                <TableCell className="capitalize">
                                                                                                        {order.status}
                                                                                                </TableCell>
                                                                                                <TableCell className="capitalize">
                                                                                                        {order.paymentMethod}
                                                                                                </TableCell>
                                                                                                <TableCell className="text-right">
                                                                                                        {order.units}
                                                                                                </TableCell>
                                                                                                <TableCell className="text-right">
                                                                                                        {formatCurrency(order.totalAmount)}
                                                                                                </TableCell>
                                                                                        </TableRow>
                                                                                ))}
                                                                        </TableBody>
                                                                </Table>
                                                        ) : (
                                                                <div className="text-sm text-muted-foreground">
                                                                        No orders found for the selected filters.
                                                                </div>
                                                        )}
                                                </CardContent>
                                        </Card>
                                </>
                        )}
                </div>
        );
}
