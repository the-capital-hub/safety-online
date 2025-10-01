"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
        DropdownMenu,
        DropdownMenuContent,
        DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, ArrowUpRight, CheckCheck, Archive } from "lucide-react";
import {
        useNotificationStore,
        useUnreadNotifications,
} from "@/store/notificationStore.js";

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
        const markPanelAsRead = useNotificationStore((state) => state.markPanelAsRead);
        const dismissNotification = useNotificationStore((state) => state.dismissNotification);
        const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
        const loading = useNotificationStore((state) => state.loading);
        const error = useNotificationStore((state) => state.error);
        const hasHydrated = useNotificationStore((state) => state.hasHydrated);
        const unreadCount = useUnreadNotifications("seller");

        useEffect(() => {
                fetchNotifications();
        }, [fetchNotifications]);

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

        const recentNotifications = sellerNotifications.slice(0, 6);

        const handleOpenCenter = () => {
                router.push("/seller/notifications");
        };

        const isLoading = !hasHydrated || loading;

        return (
                <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative">
                                        <Bell className="h-4 w-4" />
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
                                                <p className="text-sm font-semibold">Seller notifications</p>
                                                <p className="text-xs text-muted-foreground">
                                                        Track order updates and buyer activity in real time.
                                                </p>
                                        </div>
                                        <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => markPanelAsRead("seller")}
                                                disabled={unreadCount === 0}
                                        >
                                                <CheckCheck className="h-4 w-4" />
                                                <span className="sr-only">Mark seller notifications as read</span>
                                        </Button>
                                </div>
                                <ScrollArea className="max-h-96">
                                        <div className="divide-y">
                                                {error ? (
                                                        <div className="px-4 py-8 text-sm text-destructive">
                                                                Unable to load notifications. Try refreshing the page.
                                                        </div>
                                                ) : isLoading && recentNotifications.length === 0 ? (
                                                        <div className="flex flex-col gap-3 px-4 py-6">
                                                                <div className="h-3 w-32 animate-pulse rounded-full bg-muted" />
                                                                <div className="space-y-2">
                                                                        <div className="h-3 w-full animate-pulse rounded-full bg-muted" />
                                                                        <div className="h-3 w-4/5 animate-pulse rounded-full bg-muted" />
                                                                </div>
                                                                <div className="space-y-2">
                                                                        <div className="h-3 w-full animate-pulse rounded-full bg-muted" />
                                                                        <div className="h-3 w-2/3 animate-pulse rounded-full bg-muted" />
                                                                </div>
                                                        </div>
                                                ) : recentNotifications.length === 0 ? (
                                                        <div className="flex flex-col items-center justify-center py-10 text-center text-sm text-muted-foreground">
                                                                <Bell className="mb-2 h-6 w-6 text-muted-foreground" />
                                                                <p>No notifications yet</p>
                                                        </div>
                                                ) : (
                                                        recentNotifications.map((notification) => (
                                                                <motion.div
                                                                        key={notification.id}
                                                                        initial={{ opacity: 0, x: -10 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ duration: 0.2 }}
                                                                        className="px-4 py-3 hover:bg-muted/60"
                                                                >
                                                                        <div className="flex items-start gap-3">
                                                                                <Avatar className="h-9 w-9 border">
                                                                                        <AvatarFallback className="bg-primary/10 text-xs uppercase">
                                                                                                {(notification.actor?.name || "S")
                                                                                                        .split(" ")
                                                                                                        .map((part) => part[0])
                                                                                                        .join("") || "S"}
                                                                                        </AvatarFallback>
                                                                                </Avatar>
                                                                                <div className="flex-1 space-y-1">
                                                                                        <div className="flex items-center gap-2">
                                                                                                <p className="text-sm font-semibold text-foreground">
                                                                                                        {notification.title}
                                                                                                </p>
                                                                                                <Badge variant="outline" className="text-[10px] capitalize">
                                                                                                        {notification.category || "general"}
                                                                                                </Badge>
                                                                                        </div>
                                                                                        <p className="text-xs text-muted-foreground">
                                                                                                {notification.message}
                                                                                        </p>
                                                                                        {notification.metadata?.length ? (
                                                                                                <div className="flex flex-wrap gap-2 pt-1">
                                                                                                        {notification.metadata.map((item) => (
                                                                                                                <span
                                                                                                                        key={`${notification.id}-${item.label}`}
                                                                                                                        className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                                                                                                                >
                                                                                                                        {item.label}: {item.value}
                                                                                                                </span>
                                                                                                        ))}
                                                                                                </div>
                                                                                        ) : null}
                                                                                </div>
                                                                                <div className="flex flex-col items-end gap-2 text-right">
                                                                                        <span className="text-[10px] text-muted-foreground">
                                                                                                {formatRelativeTime(notification.createdAt)}
                                                                                        </span>
                                                                                        {!notification.read && (
                                                                                                <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                                                                                        )}
                                                                                </div>
                                                                        </div>
                                                                        <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                                                                                <div className="flex items-center gap-2">
                                                                                        {notification.link?.href && (
                                                                                                <Button
                                                                                                        variant="link"
                                                                                                        size="sm"
                                                                                                        className="px-0"
                                                                                                        onClick={() => {
                                                                                                                markAsRead(notification.id);
                                                                                                                router.push(notification.link.href);
                                                                                                        }}
                                                                                                >
                                                                                                        {notification.link?.label || "View details"}
                                                                                                        <ArrowUpRight className="ml-1 h-3 w-3" />
                                                                                                </Button>
                                                                                        )}
                                                                                        <Button
                                                                                                variant="link"
                                                                                                size="sm"
                                                                                                className="px-0"
                                                                                                onClick={() => markAsRead(notification.id)}
                                                                                        >
                                                                                                Mark as read
                                                                                        </Button>
                                                                                </div>
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
                                                                </motion.div>
                                                        ))
                                                )}
                                        </div>
                                </ScrollArea>
                                <div className="flex items-center justify-between border-t px-4 py-2">
                                        <Button variant="secondary" size="sm" onClick={handleOpenCenter}>
                                                Open notification center
                                        </Button>
                                        <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs"
                                                onClick={() => markPanelAsRead("seller")}
                                                disabled={unreadCount === 0}
                                        >
                                                Clear unread
                                        </Button>
                                </div>
                        </DropdownMenuContent>
                </DropdownMenu>
        );
}
