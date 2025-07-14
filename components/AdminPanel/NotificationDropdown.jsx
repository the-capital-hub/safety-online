"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, MoreHorizontal } from "lucide-react";

const notifications = [
	{
		id: 1,
		user: "Kristin Watson",
		action: "New Order",
		time: "Jun 23",
		avatar: "/placeholder.svg?height=32&width=32",
		unread: true,
	},
	{
		id: 2,
		user: "Brooklyn Simmons",
		action: "Purchased Helmet",
		time: "Nov 16",
		avatar: "/placeholder.svg?height=32&width=32",
		unread: true,
	},
	{
		id: 3,
		user: "Brooklyn Simmons",
		action: "Purchased Safety Jacket",
		time: "Nov 16",
		avatar: "/placeholder.svg?height=32&width=32",
		unread: true,
	},
];

export function NotificationDropdown() {
	const [unreadCount, setUnreadCount] = useState(3);

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
							{unreadCount}
						</Badge>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-80" align="end">
				<div className="flex items-center justify-between p-4 border-b">
					<h3 className="font-semibold">Notification</h3>
					<Button variant="ghost" size="icon">
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</div>
				<div className="max-h-80 overflow-y-auto">
					{notifications.map((notification) => (
						<motion.div
							key={notification.id}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
						>
							<Avatar className="h-10 w-10">
								<AvatarImage src={notification.avatar || "/placeholder.svg"} />
								<AvatarFallback>
									{notification.user
										.split(" ")
										.map((n) => n[0])
										.join("")}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-gray-900 truncate">
									{notification.user}
								</p>
								<p className="text-sm text-gray-500 truncate">
									{notification.action}
								</p>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-xs text-gray-400">
									{notification.time}
								</span>
								{notification.unread && (
									<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
								)}
							</div>
						</motion.div>
					))}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
