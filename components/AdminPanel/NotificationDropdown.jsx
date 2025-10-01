"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, CheckCheck, ArrowUpRight, Archive, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
        DropdownMenu,
        DropdownMenuContent,
        DropdownMenuItem,
        DropdownMenuSeparator,
        DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
        useNotificationStore,
        useUnreadNotifications,
} from "@/store/notificationStore.js";

const panelStyles = {
        admin: "bg-blue-100 text-blue-700 border border-blue-200",
        seller: "bg-emerald-100 text-emerald-700 border border-emerald-200",
        buyer: "bg-amber-100 text-amber-700 border border-amber-200",
};

const severityAccent = {
        info: "bg-blue-50 text-blue-600 border-blue-100",
        success: "bg-emerald-50 text-emerald-600 border-emerald-100",
        warning: "bg-amber-50 text-amber-600 border-amber-100",
        critical: "bg-red-50 text-red-600 border-red-100",
};

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

        return target.toLocaleDateString();
};

export function NotificationDropdown() {
        const router = useRouter();
        const notifications = useNotificationStore((state) => state.notifications);
        const markAsRead = useNotificationStore((state) => state.markAsRead);
        const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
        const dismissNotification = useNotificationStore((state) => state.dismissNotification);
        const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
        const loading = useNotificationStore((state) => state.loading);
        const error = useNotificationStore((state) => state.error);
        const hasHydrated = useNotificationStore((state) => state.hasHydrated);
        const unreadCount = useUnreadNotifications();

        useEffect(() => {
                fetchNotifications();
        }, [fetchNotifications]);

        const recentNotifications = useMemo(
                () => notifications.slice(0, 6),
                [notifications]
        );

        const handleNotificationClick = (notification) => {
                markAsRead(notification.id);
                if (notification.link?.href) {
                        router.push(notification.link.href);
                }
        };

        const isLoading = !hasHydrated || loading;

        return (
                <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative">
                                        <Bell className="h-5 w-5" />
                                        {unreadCount > 0 && (
                                                <Badge
                                                        variant="destructive"
                                                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                                                >
                                                        {unreadCount > 9 ? "9+" : unreadCount}
                                                </Badge>
                                        )}
                                </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-96 p-0" align="end" forceMount>
                                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
                                        <div>
                                                <p className="text-sm font-semibold">Notifications</p>
                                                <p className="text-xs text-muted-foreground">
                                                        Stay on top of buyer, seller and admin activity
                                                </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                                <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={markAllAsRead}
                                                        disabled={unreadCount === 0}
                                                >
                                                        <CheckCheck className="h-4 w-4" />
                                                        <span className="sr-only">Mark all as read</span>
                                                </Button>
                                        </div>
                                </div>
                                <ScrollArea className="max-h-96">
                                        <div className="divide-y">
                                                {error ? (
                                                        <div className="px-4 py-8 text-sm text-destructive">
                                                                Unable to load notifications. Please try again shortly.
                                                        </div>
                                                ) : isLoading && recentNotifications.length === 0 ? (
                                                        <div className="flex flex-col gap-3 px-4 py-6">
                                                                <div className="h-3 w-32 animate-pulse rounded-full bg-muted" />
                                                                <div className="space-y-2">
                                                                        <div className="h-3 w-full animate-pulse rounded-full bg-muted" />
                                                                        <div className="h-3 w-3/4 animate-pulse rounded-full bg-muted" />
                                                                </div>
                                                                <div className="space-y-2">
                                                                        <div className="h-3 w-full animate-pulse rounded-full bg-muted" />
                                                                        <div className="h-3 w-2/3 animate-pulse rounded-full bg-muted" />
                                                                </div>
                                                        </div>
                                                ) : recentNotifications.length === 0 ? (
                                                        <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                                                                <EyeOff className="mb-2 h-10 w-10" />
                                                                <p className="font-medium">You're all caught up</p>
                                                                <p className="text-sm">
                                                                        New notifications will appear here from all panels.
                                                                </p>
                                                        </div>
                                                ) : (
                                                        recentNotifications.map((notification) => (
                                                                <motion.div
                                                                        key={notification.id}
                                                                        initial={{ opacity: 0, x: 10 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ duration: 0.2 }}
                                                                        className="flex gap-3 px-4 py-3 hover:bg-muted/60"
                                                                >
                                                                        <div
                                                                                className={`mt-1 h-8 w-8 flex items-center justify-center rounded-full border ${
                                                                                        severityAccent[notification.severity] ||
                                                                                        severityAccent.info
                                                                                }`}
                                                                        >
                                                                                <span className="text-xs font-semibold uppercase">
                                                                                        {notification.panel?.[0] || "A"}
                                                                                </span>
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                                <div className="flex items-start justify-between gap-2">
                                                                                        <div className="space-y-1">
                                                                                                <div className="flex items-center gap-2">
                                                                                                        <p className="text-sm font-semibold text-foreground">
                                                                                                                {notification.title}
                                                                                                        </p>
                                                                                                        <Badge
                                                                                                                variant="outline"
                                                                                                                className={`text-[10px] font-medium capitalize ${
                                                                                                                        panelStyles[notification.panel] ||
                                                                                                                        panelStyles.admin
                                                                                                                }`}
                                                                                                        >
                                                                                                                {notification.panel || "admin"}
                                                                                                        </Badge>
                                                                                                </div>
                                                                                                <p className="text-xs text-muted-foreground line-clamp-2">
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
                                                                                        </div>
                                                                                        <div className="flex flex-col items-end gap-2">
                                                                                                <span className="text-[10px] text-muted-foreground">
                                                                                                        {formatRelativeTime(notification.createdAt)}
                                                                                                </span>
                                                                                                {!notification.read && (
                                                                                                        <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                                                                                                )}
                                                                                        </div>
                                                                                </div>
                                                                                <div className="mt-2 flex items-center justify-between gap-3">
                                                                                        {notification.link?.href ? (
                                                                                                <Button
                                                                                                        variant="link"
                                                                                                        size="sm"
                                                                                                        className="px-0 h-auto text-xs"
                                                                                                        onClick={() => handleNotificationClick(notification)}
                                                                                                >
                                                                                                        {notification.link?.label || "View details"}
                                                                                                        <ArrowUpRight className="ml-1 h-3 w-3" />
                                                                                                </Button>
                                                                                        ) : (
                                                                                                <Button
                                                                                                        variant="link"
                                                                                                        size="sm"
                                                                                                        className="px-0 h-auto text-xs"
                                                                                                        onClick={() => markAsRead(notification.id)}
                                                                                                >
                                                                                                        Mark as read
                                                                                                </Button>
                                                                                        )}
                                                                                        <Button
                                                                                                variant="ghost"
                                                                                                size="sm"
                                                                                                className="h-7 px-2 text-[11px]"
                                                                                                onClick={() => dismissNotification(notification.id)}
                                                                                        >
                                                                                                <Archive className="mr-1 h-3 w-3" />
                                                                                                Archive
                                                                                        </Button>
                                                                                </div>
                                                                        </div>
                                                                </motion.div>
                                                        ))
                                                )}
                                        </div>
                                </ScrollArea>
                                <DropdownMenuSeparator />
                                <div className="flex items-center justify-between px-4 py-2">
                                        <Button
                                                variant="secondary"
                                                className="h-8 text-xs"
                                                onClick={() => router.push("/admin/notifications")}
                                        >
                                                Open notification center
                                        </Button>
                                        <DropdownMenuItem
                                                className="text-xs text-muted-foreground"
                                                onClick={() => router.push("/admin/settings")}
                                        >
                                                Manage preferences
                                        </DropdownMenuItem>
                                </div>
                        </DropdownMenuContent>
                </DropdownMenu>
        );
}
