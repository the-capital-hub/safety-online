"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
        Bell,
        ArrowUpRight,
        Archive,
        Filter,
        Inbox,
        Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
        useNotificationStore,
        useUnreadNotifications,
} from "@/store/notificationStore.js";
import { useIsSellerAuthenticated } from "@/store/sellerAuthStore";

const severityFilters = [
        { value: "all", label: "All" },
        { value: "info", label: "Informational" },
        { value: "success", label: "Success" },
        { value: "warning", label: "Attention" },
        { value: "critical", label: "Critical" },
];

const formatRelativeTime = (timestamp) => {
        const now = new Date();
        const target = new Date(timestamp);
        const diffMs = target.getTime() - now.getTime();

        const units = [
                { limit: 60, divisor: 1, unit: "second" },
                { limit: 3600, divisor: 60, unit: "minute" },
                { limit: 86400, divisor: 3600, unit: "hour" },
                { limit: 604800, divisor: 86400, unit: "day" },
                { limit: 2629800, divisor: 604800, unit: "week" },
        ];

        const diffSeconds = Math.round(Math.abs(diffMs) / 1000);

        for (const { limit, divisor, unit } of units) {
                if (diffSeconds < limit) {
                        const value = Math.round(diffSeconds / divisor) * Math.sign(diffMs || 1);
                        return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
                                value,
                                unit
                        );
                }
        }

        return target.toLocaleString();
};

const groupByDate = (notifications) => {
        return notifications.reduce((groups, notification) => {
                const key = new Date(notification.createdAt).toISOString().slice(0, 10);
                if (!groups[key]) {
                        groups[key] = [];
                }
                groups[key].push(notification);
                return groups;
        }, {});
};

const formatDateHeading = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString("en-IN", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
        });
};

export default function SellerNotificationsPage() {
        const router = useRouter();
        const isAuthenticated = useIsSellerAuthenticated();
        const notifications = useNotificationStore((state) => state.notifications);
        const markAsRead = useNotificationStore((state) => state.markAsRead);
        const markAsUnread = useNotificationStore((state) => state.markAsUnread);
        const dismissNotification = useNotificationStore((state) => state.dismissNotification);
        const markPanelAsRead = useNotificationStore((state) => state.markPanelAsRead);
        const unreadCount = useUnreadNotifications("seller");

        useEffect(() => {
                if (!isAuthenticated) {
                        router.push("/seller/login");
                }
        }, [isAuthenticated, router]);

        const [searchTerm, setSearchTerm] = useState("");
        const [activeSeverity, setActiveSeverity] = useState("all");
        const [showUnreadOnly, setShowUnreadOnly] = useState(false);
        const [activeCategory, setActiveCategory] = useState("all");

        const sellerNotifications = useMemo(
                () =>
                        notifications
                                .filter((notification) => notification.panel === "seller")
                                .sort(
                                        (a, b) =>
                                                new Date(b.createdAt).getTime() -
                                                new Date(a.createdAt).getTime()
                                ),
                [notifications]
        );

        const categoryOptions = useMemo(() => {
                const uniqueCategories = new Set(
                        sellerNotifications.map((notification) => notification.category || "general")
                );
                return ["all", ...Array.from(uniqueCategories)];
        }, [sellerNotifications]);

        useEffect(() => {
                if (!categoryOptions.includes(activeCategory)) {
                        setActiveCategory("all");
                }
        }, [categoryOptions, activeCategory]);

        const filteredNotifications = useMemo(() => {
                        const term = searchTerm.trim().toLowerCase();
                        return sellerNotifications.filter((notification) => {
                                const matchesSeverity =
                                        activeSeverity === "all" || notification.severity === activeSeverity;
                                const matchesCategory =
                                        activeCategory === "all" || notification.category === activeCategory;
                                const matchesUnread = !showUnreadOnly || !notification.read;
                                const haystack = `${notification.title} ${notification.message} ${
                                        notification.metadata
                                                ?.map((item) => `${item.label} ${item.value}`)
                                                .join(" ") || ""
                                }`.toLowerCase();
                                const matchesSearch = term.length === 0 || haystack.includes(term);

                                return matchesSeverity && matchesCategory && matchesUnread && matchesSearch;
                        });
                },
                [sellerNotifications, activeSeverity, activeCategory, showUnreadOnly, searchTerm]
        );

        const groupedNotifications = useMemo(() => {
                const groups = groupByDate(filteredNotifications);
                return Object.entries(groups)
                        .map(([date, items]) => ({
                                date,
                                items: items.sort(
                                        (a, b) =>
                                                new Date(b.createdAt).getTime() -
                                                new Date(a.createdAt).getTime()
                                ),
                        }))
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }, [filteredNotifications]);

        const todayKey = new Date().toISOString().slice(0, 10);
        const todaysNotifications = useMemo(
                () =>
                        sellerNotifications.filter(
                                (notification) =>
                                        new Date(notification.createdAt).toISOString().slice(0, 10) === todayKey
                        ),
                [sellerNotifications, todayKey]
        );

        const criticalAttention = useMemo(
                () =>
                        sellerNotifications.filter(
                                (notification) =>
                                        ["warning", "critical"].includes(notification.severity) && !notification.read
                        ).length,
                [sellerNotifications]
        );

        const handleNavigate = (href, id) => {
                if (id) {
                        markAsRead(id);
                }
                if (href) {
                        router.push(href);
                }
        };

        return (
                <div className="space-y-6 p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                        <h1 className="text-2xl font-semibold tracking-tight">Seller notifications</h1>
                                        <p className="text-sm text-muted-foreground">
                                                Monitor orders, payouts and buyer activity for your storefront.
                                        </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                        <Button
                                                variant="outline"
                                                className="gap-2"
                                                onClick={() => markPanelAsRead("seller")}
                                                disabled={unreadCount === 0}
                                        >
                                                <Sparkles className="h-4 w-4" />
                                                Mark all as read
                                        </Button>
                                        <Button variant="secondary" className="gap-2" onClick={() => router.push("/seller/orders")}
                                        >
                                                <ArrowUpRight className="h-4 w-4" />
                                                Go to orders
                                        </Button>
                                </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <Card>
                                        <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                                        Total alerts
                                                </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                                <p className="text-2xl font-semibold">{sellerNotifications.length}</p>
                                                <p className="text-xs text-muted-foreground">
                                                        {todaysNotifications.length} new today
                                                </p>
                                        </CardContent>
                                </Card>
                                <Card>
                                        <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                                        Unread updates
                                                </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-1">
                                                <p className="text-2xl font-semibold">{unreadCount}</p>
                                                <p className="text-xs text-muted-foreground">
                                                        Stay up to date by reviewing new activity promptly.
                                                </p>
                                        </CardContent>
                                </Card>
                                <Card>
                                        <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                                        Needs attention
                                                </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                                <p className="text-2xl font-semibold">{criticalAttention}</p>
                                                <p className="text-xs text-muted-foreground">
                                                        Pending warnings or escalations requiring action.
                                                </p>
                                        </CardContent>
                                </Card>
                                <Card>
                                        <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                                        Latest sync
                                                </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-1">
                                                <p className="text-2xl font-semibold">
                                                        {sellerNotifications[0]
                                                                ? formatRelativeTime(sellerNotifications[0].createdAt)
                                                                : "Just now"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                        Notifications update automatically as events occur.
                                                </p>
                                        </CardContent>
                                </Card>
                        </div>

                        <Card>
                                <CardHeader className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <Filter className="h-4 w-4" />
                                                                Filters
                                                        </div>
                                                        <Tabs
                                                                value={activeSeverity}
                                                                onValueChange={setActiveSeverity}
                                                                className="w-fit"
                                                        >
                                                                <TabsList>
                                                                        {severityFilters.map((filter) => (
                                                                                <TabsTrigger key={filter.value} value={filter.value}>
                                                                                        {filter.label}
                                                                                </TabsTrigger>
                                                                        ))}
                                                                </TabsList>
                                                        </Tabs>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-2 text-sm">
                                                                <Switch
                                                                        id="seller-unread-only"
                                                                        checked={showUnreadOnly}
                                                                        onCheckedChange={setShowUnreadOnly}
                                                                />
                                                                <label htmlFor="seller-unread-only" className="text-sm text-muted-foreground">
                                                                        Show unread only
                                                                </label>
                                                        </div>
                                                        <div className="w-full sm:w-60">
                                                                <Input
                                                                        placeholder="Search notifications"
                                                                        value={searchTerm}
                                                                        onChange={(event) => setSearchTerm(event.target.value)}
                                                                />
                                                        </div>
                                                </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                                {categoryOptions.map((category) => (
                                                        <Badge
                                                                key={category}
                                                                variant={category === activeCategory ? "default" : "outline"}
                                                                className="cursor-pointer text-xs capitalize"
                                                                onClick={() => setActiveCategory(category)}
                                                        >
                                                                {category === "all" ? "All categories" : category.replace(/-/g, " ")}
                                                        </Badge>
                                                ))}
                                        </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                        <ScrollArea className="max-h-[60vh]">
                                                <div className="divide-y">
                                                        {groupedNotifications.length === 0 ? (
                                                                <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
                                                                        <Inbox className="h-6 w-6" />
                                                                        <p className="text-sm">No notifications match your filters yet.</p>
                                                                </div>
                                                        ) : (
                                                                groupedNotifications.map((group) => (
                                                                        <div key={group.date} className="space-y-4 p-6">
                                                                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                                                        <Bell className="h-3 w-3" />
                                                                                        {formatDateHeading(group.date)}
                                                                                </div>
                                                                                <div className="space-y-4">
                                                                                        {group.items.map((notification) => (
                                                                                                <motion.div
                                                                                                        key={notification.id}
                                                                                                        initial={{ opacity: 0, y: 8 }}
                                                                                                        animate={{ opacity: 1, y: 0 }}
                                                                                                        transition={{ duration: 0.2 }}
                                                                                                        className="rounded-lg border bg-background p-4 shadow-sm"
                                                                                                >
                                                                                                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                                                                                                <div className="space-y-2">
                                                                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                                                                                <h3 className="text-base font-semibold text-foreground">
                                                                                                                                        {notification.title}
                                                                                                                                </h3>
                                                                                                                                <Badge
                                                                                                                                        variant="outline"
                                                                                                                                        className="text-xs capitalize"
                                                                                                                                >
                                                                                                                                        {notification.severity}
                                                                                                                                </Badge>
                                                                                                                                <Badge
                                                                                                                                        variant="secondary"
                                                                                                                                        className="text-xs capitalize"
                                                                                                                                >
                                                                                                                                        {notification.category || "general"}
                                                                                                                                </Badge>
                                                                                                                        </div>
                                                                                                                        <p className="text-sm text-muted-foreground">
                                                                                                                                {notification.message}
                                                                                                                        </p>
                                                                                                                        {notification.metadata?.length ? (
                                                                                                                                <div className="flex flex-wrap gap-2">
                                                                                                                                        {notification.metadata.map((item) => (
                                                                                                                                                <span
                                                                                                                                                        key={`${notification.id}-${item.label}`}
                                                                                                                                                        className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                                                                                                                                                >
                                                                                                                                                        {item.label}: {item.value}
                                                                                                                                                </span>
                                                                                                                                        ))}
                                                                                                                                </div>
                                                                                                                        ) : null}
                                                                                                                </div>
                                                                                                                <div className="flex flex-col items-end gap-2 text-right text-xs text-muted-foreground">
                                                                                                                        <span>{formatRelativeTime(notification.createdAt)}</span>
                                                                                                                        {!notification.read && (
                                                                                                                                <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                                                                                                                        )}
                                                                                                                </div>
                                                                                                        </div>
                                                                                                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                                                                                                                <div className="flex flex-wrap items-center gap-3">
                                                                                                                        {notification.link?.href && (
                                                                                                                                <Button
                                                                                                                                        variant="link"
                                                                                                                                        size="sm"
                                                                                                                                        className="px-0"
                                                                                                                                        onClick={() => handleNavigate(notification.link.href, notification.id)}
                                                                                                                                >
                                                                                                                                        {notification.link?.label || "View details"}
                                                                                                                                        <ArrowUpRight className="ml-1 h-3 w-3" />
                                                                                                                                </Button>
                                                                                                                        )}
                                                                                                                        {notification.read ? (
                                                                                                                                <Button
                                                                                                                                        variant="link"
                                                                                                                                        size="sm"
                                                                                                                                        className="px-0"
                                                                                                                                        onClick={() => markAsUnread(notification.id)}
                                                                                                                                >
                                                                                                                                        Mark as unread
                                                                                                                                </Button>
                                                                                                                        ) : (
                                                                                                                                <Button
                                                                                                                                        variant="link"
                                                                                                                                        size="sm"
                                                                                                                                        className="px-0"
                                                                                                                                        onClick={() => markAsRead(notification.id)}
                                                                                                                                >
                                                                                                                                        Mark as read
                                                                                                                                </Button>
                                                                                                                        )}
                                                                                                                </div>
                                                                                                                <Button
                                                                                                                        variant="ghost"
                                                                                                                        size="sm"
                                                                                                                        className="h-8 px-3 text-xs"
                                                                                                                        onClick={() => dismissNotification(notification.id)}
                                                                                                                >
                                                                                                                        <Archive className="mr-2 h-3 w-3" />
                                                                                                                        Archive
                                                                                                                </Button>
                                                                                                        </div>
                                                                                                </motion.div>
                                                                                        ))}
                                                                                </div>
                                                                        </div>
                                                                ))
                                                        )}
                                                </div>
                                        </ScrollArea>
                                </CardContent>
                        </Card>
                </div>
        );
}
