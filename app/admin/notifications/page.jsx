"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
        AlertTriangle,
        CheckCircle2,
        Info,
        ShieldAlert,
        BellRing,
        Filter,
        Inbox,
        Clock3,
        ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
        useNotificationStore,
        useUnreadNotifications,
} from "@/store/notificationStore.js";

const panelFilters = [
        { value: "all", label: "All panels" },
        { value: "admin", label: "Admin" },
        { value: "seller", label: "Seller" },
        { value: "buyer", label: "Buyer" },
];

const severityFilters = [
        { value: "all", label: "All" },
        { value: "info", label: "Informational" },
        { value: "success", label: "Success" },
        { value: "warning", label: "Attention" },
        { value: "critical", label: "Critical" },
];

const severityStyles = {
        info: {
                icon: Info,
                badge: "bg-blue-100 text-blue-700 border-blue-200",
        },
        success: {
                icon: CheckCircle2,
                badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
        },
        warning: {
                icon: AlertTriangle,
                badge: "bg-amber-100 text-amber-700 border-amber-200",
        },
        critical: {
                icon: ShieldAlert,
                badge: "bg-red-100 text-red-700 border-red-200",
        },
};

const panelBadgeStyles = {
        admin: "bg-blue-50 text-blue-700 border-blue-200",
        seller: "bg-emerald-50 text-emerald-700 border-emerald-200",
        buyer: "bg-amber-50 text-amber-700 border-amber-200",
};

const formatRelativeTime = (timestamp) => {
        const now = new Date();
        const target = new Date(timestamp);
        const diffMs = target.getTime() - now.getTime();
        const diffSeconds = Math.round(Math.abs(diffMs) / 1000);

        const thresholds = [
                { limit: 60, divisor: 1, unit: "second" },
                { limit: 3600, divisor: 60, unit: "minute" },
                { limit: 86400, divisor: 3600, unit: "hour" },
                { limit: 604800, divisor: 86400, unit: "day" },
                { limit: 2629800, divisor: 604800, unit: "week" },
        ];

        for (const { limit, divisor, unit } of thresholds) {
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

const formatDateHeading = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
        });
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

const panelLabels = {
        admin: "Admin",
        seller: "Seller",
        buyer: "Buyer",
};

export default function AdminNotificationsPage() {
        const router = useRouter();
        const notifications = useNotificationStore((state) => state.notifications);
        const markAsRead = useNotificationStore((state) => state.markAsRead);
        const markAsUnread = useNotificationStore((state) => state.markAsUnread);
        const dismissNotification = useNotificationStore((state) => state.dismissNotification);
        const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
        const markPanelAsRead = useNotificationStore((state) => state.markPanelAsRead);
        const unreadCounts = useNotificationStore((state) => state.unreadCounts);

        const [activePanel, setActivePanel] = useState("all");
        const [activeSeverity, setActiveSeverity] = useState("all");
        const [searchTerm, setSearchTerm] = useState("");
        const [showUnreadOnly, setShowUnreadOnly] = useState(false);

        const filteredNotifications = useMemo(() => {
                return notifications.filter((notification) => {
                        const matchesPanel =
                                activePanel === "all" || notification.panel === activePanel;
                        const matchesSeverity =
                                activeSeverity === "all" || notification.severity === activeSeverity;
                        const matchesUnread = !showUnreadOnly || !notification.read;
                        const haystack = `${notification.title} ${notification.message} ${
                                notification.metadata?.map((item) => `${item.label} ${item.value}`).join(" ") || ""
                        }`.toLowerCase();
                        const matchesSearch = haystack.includes(searchTerm.toLowerCase());

                        return matchesPanel && matchesSeverity && matchesUnread && matchesSearch;
                });
        }, [notifications, activePanel, activeSeverity, searchTerm, showUnreadOnly]);

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

        const totalUnread = useUnreadNotifications();
        const todaysNotifications = useMemo(() => {
                const todayKey = new Date().toISOString().slice(0, 10);
                return notifications.filter(
                        (notification) =>
                                new Date(notification.createdAt).toISOString().slice(0, 10) === todayKey
                );
        }, [notifications]);

        const handlePanelRead = () => {
                markPanelAsRead(activePanel);
        };

        return (
                <div className="space-y-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                        <h1 className="text-2xl font-semibold tracking-tight">Notification center</h1>
                                        <p className="text-sm text-muted-foreground">
                                                Monitor system-wide activity across buyers, sellers and admins from
                                                a single place.
                                        </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                        <Button
                                                variant="outline"
                                                className="gap-2"
                                                onClick={() => markAllAsRead()}
                                                disabled={totalUnread === 0}
                                        >
                                                <CheckCircle2 className="h-4 w-4" />
                                                Mark all read
                                        </Button>
                                        <Button
                                                variant="secondary"
                                                className="gap-2"
                                                onClick={handlePanelRead}
                                                disabled={activePanel !== "all" && unreadCounts[activePanel] === 0}
                                        >
                                                <BellRing className="h-4 w-4" />
                                                Acknowledge {activePanel === "all" ? "all panels" : panelLabels[activePanel]}
                                        </Button>
                                </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <Card>
                                        <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                                        Total notifications
                                                </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                                <p className="text-2xl font-semibold">{notifications.length}</p>
                                                <p className="text-xs text-muted-foreground">
                                                        {todaysNotifications.length} new today
                                                </p>
                                        </CardContent>
                                </Card>
                                <Card>
                                        <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                                        Unread alerts
                                                </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-1">
                                                <p className="text-2xl font-semibold">{totalUnread}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span>{unreadCounts.seller} seller</span>
                                                        <span className="text-muted-foreground/60">•</span>
                                                        <span>{unreadCounts.buyer} buyer</span>
                                                        <span className="text-muted-foreground/60">•</span>
                                                        <span>{unreadCounts.admin} admin</span>
                                                </div>
                                        </CardContent>
                                </Card>
                                <Card>
                                        <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                                        Active attention items
                                                </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                                <p className="text-2xl font-semibold">
                                                        {
                                                                notifications.filter((notification) =>
                                                                        ["warning", "critical"].includes(
                                                                                notification.severity
                                                                        ) && !notification.read
                                                                ).length
                                                        }
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                        Pending escalations requiring review
                                                </p>
                                        </CardContent>
                                </Card>
                                <Card>
                                        <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                                        Last reviewed
                                                </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-1">
                                                <p className="text-2xl font-semibold">
                                                        {formatRelativeTime(
                                                                useNotificationStore.getState().lastViewedAt ||
                                                                        notifications[0]?.createdAt ||
                                                                        new Date().toISOString()
                                                        )}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                        Keeping audit trail fresh
                                                </p>
                                        </CardContent>
                                </Card>
                        </div>

                        <Card>
                                <CardHeader className="space-y-4">
                                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                                <div className="flex flex-wrap items-center gap-3">
                                                        <Filter className="h-4 w-4 text-muted-foreground" />
                                                        <Tabs value={activePanel} onValueChange={setActivePanel}>
                                                                <TabsList>
                                                                        {panelFilters.map((filter) => (
                                                                                <TabsTrigger key={filter.value} value={filter.value}>
                                                                                        {filter.label}
                                                                                        {filter.value !== "all" && (
                                                                                                <Badge className="ml-2">
                                                                                                        {unreadCounts[filter.value] || 0}
                                                                                                </Badge>
                                                                                        )}
                                                                                </TabsTrigger>
                                                                        ))}
                                                                </TabsList>
                                                        </Tabs>
                                                        <Tabs value={activeSeverity} onValueChange={setActiveSeverity}>
                                                                <TabsList>
                                                                        {severityFilters.map((filter) => (
                                                                                <TabsTrigger key={filter.value} value={filter.value}>
                                                                                        {filter.label}
                                                                                </TabsTrigger>
                                                                        ))}
                                                                </TabsList>
                                                        </Tabs>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3">
                                                        <div className="relative w-full sm:w-64">
                                                                <Input
                                                                        value={searchTerm}
                                                                        onChange={(event) => setSearchTerm(event.target.value)}
                                                                        placeholder="Search activity, orders, people"
                                                                        className="pl-3"
                                                                />
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                <Switch
                                                                        id="unread-only"
                                                                        checked={showUnreadOnly}
                                                                        onCheckedChange={setShowUnreadOnly}
                                                                />
                                                                <label htmlFor="unread-only">Show unread only</label>
                                                        </div>
                                                </div>
                                        </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                        <ScrollArea className="max-h-[62vh]">
                                                {filteredNotifications.length === 0 ? (
                                                        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                                                                <Inbox className="mb-3 h-10 w-10" />
                                                                <p className="font-medium">No notifications match the current filters.</p>
                                                                <p className="text-sm">
                                                                        Adjust the filters above or clear search to see more updates.
                                                                </p>
                                                        </div>
                                                ) : (
                                                        <div className="space-y-6 px-6 py-6">
                                                                {groupedNotifications.map((group) => (
                                                                        <div key={group.date} className="space-y-4">
                                                                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                                                                        <Clock3 className="h-4 w-4" />
                                                                                        <span>{formatDateHeading(group.date)}</span>
                                                                                </div>
                                                                                <div className="space-y-3">
                                                                                        {group.items.map((notification) => {
                                                                                                const severity =
                                                                                                        severityStyles[
                                                                                                                notification.severity
                                                                                                        ] || severityStyles.info;
                                                                                                const SeverityIcon = severity.icon;

                                                                                                return (
                                                                                                        <div
                                                                                                                key={notification.id}
                                                                                                                className={`flex gap-3 rounded-lg border p-4 transition hover:border-primary/40 hover:shadow-sm ${
                                                                                                                        !notification.read
                                                                                                                                ? "border-primary/50 bg-primary/5"
                                                                                                                                : "bg-background"
                                                                                                                }`}
                                                                                                        >
                                                                                                                <div
                                                                                                                        className={`mt-1 flex h-9 w-9 items-center justify-center rounded-full border ${severity.badge}`}
                                                                                                                >
                                                                                                                        <SeverityIcon className="h-4 w-4" />
                                                                                                                </div>
                                                                                                                <div className="flex-1 space-y-3">
                                                                                                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                                                                                                <div className="space-y-1">
                                                                                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                                                                                                <span className="text-sm font-semibold">
                                                                                                                                                        {notification.title}
                                                                                                                                                </span>
                                                                                                                                                <Badge
                                                                                                                                                        className={`text-[10px] uppercase tracking-wide ${
                                                                                                                                                                panelBadgeStyles[notification.panel] ||
                                                                                                                                                                panelBadgeStyles.admin
                                                                                                                                                        }`}
                                                                                                                                                >
                                                                                                                                                        {panelLabels[notification.panel] || "Admin"}
                                                                                                                                                </Badge>
                                                                                                                                                <Badge
                                                                                                                                                        variant="outline"
                                                                                                                                                        className="text-[10px] uppercase tracking-wide"
                                                                                                                                                >
                                                                                                                                                        {notification.category}
                                                                                                                                                </Badge>
                                                                                                                                        </div>
                                                                                                                                        <p className="text-xs text-muted-foreground">
                                                                                                                                                {notification.message}
                                                                                                                                        </p>
                                                                                                                                        {notification.metadata?.length > 0 && (
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
                                                                                                                                        )}
                                                                                                                                        {notification.actor && (
                                                                                                                                                <p className="text-[11px] text-muted-foreground">
                                                                                                                                                        Actor: {notification.actor.name}
                                                                                                                                                        {notification.actor.role
                                                                                                                                                                ? ` • ${notification.actor.role}`
                                                                                                                                                                : ""}
                                                                                                                                                </p>
                                                                                                                                        )}
                                                                                                                                </div>
                                                                                                                                <div className="flex flex-col items-end gap-2">
                                                                                                                                        <span className="text-[11px] text-muted-foreground">
                                                                                                                                                {formatRelativeTime(notification.createdAt)}
                                                                                                                                        </span>
                                                                                                                                        {!notification.read && (
                                                                                                                                                <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                                                                                                                                        )}
                                                                                                                                </div>
                                                                                                                        </div>
                                                                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                                                                                <Button
                                                                                                                                        variant="link"
                                                                                                                                        className="h-auto px-0 text-xs"
                                                                                                                                        onClick={() =>
                                                                                                                                                notification.read
                                                                                                                                                        ? markAsUnread(notification.id)
                                                                                                                                                        : markAsRead(notification.id)
                                                                                                                                        }
                                                                                                                                >
                                                                                                                                        {notification.read
                                                                                                                                                ? "Mark as unread"
                                                                                                                                                : "Mark as read"}
                                                                                                                                </Button>
                                                                                                                                <Button
                                                                                                                                        variant="link"
                                                                                                                                        className="h-auto px-0 text-xs"
                                                                                                                                        onClick={() => dismissNotification(notification.id)}
                                                                                                                                >
                                                                                                                                        Archive
                                                                                                                                </Button>
                                                                                                                                {notification.link?.href && (
                                                                                                                                        <Button
                                                                                                                                                variant="ghost"
                                                                                                                                                size="sm"
                                                                                                                                                className="h-8 gap-1"
                                                                                                                                                onClick={() => router.push(notification.link.href)}
                                                                                                                                        >
                                                                                                                                                View details
                                                                                                                                                <ArrowUpRight className="h-3 w-3" />
                                                                                                                                        </Button>
                                                                                                                                )}
                                                                                                                        </div>
                                                                                                                </div>
                                                                                                        </div>
                                                                                                );
                                                                                        })}
                                                                                </div>
                                                                        </div>
                                                                ))}
                                                        </div>
                                                )}
                                        </ScrollArea>
                                </CardContent>
                        </Card>
                </div>
        );
}
