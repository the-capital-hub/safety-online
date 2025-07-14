"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, User, Settings, LogOut } from "lucide-react";
import { NotificationDropdown } from "@/components/AdminPanel/NotificationDropdown.jsx";
import { LogoutPopup } from "@/components/Shared/Popups/LogoutPopup.jsx";

export function AdminHeader() {
	const [showLogoutPopup, setShowLogoutPopup] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	return (
		<>
			<motion.header
				className="flex items-center justify-between py-4 px-6 bg-white"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<div className="flex items-center gap-4">
					<SidebarTrigger />
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
						<Input
							placeholder="Search"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 w-80"
						/>
					</div>
				</div>

				<div className="flex items-center gap-4">
					<NotificationDropdown />

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="relative h-8 w-8 rounded-full">
								<Avatar className="h-8 w-8">
									<AvatarImage
										src="/placeholder.svg?height=32&width=32"
										alt="Admin"
									/>
									<AvatarFallback>AD</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56" align="end" forceMount>
							<DropdownMenuItem>
								<User className="mr-2 h-4 w-4" />
								<span>Profile settings</span>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Settings className="mr-2 h-4 w-4" />
								<span>Account settings</span>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="text-red-600"
								onClick={() => setShowLogoutPopup(true)}
							>
								<LogOut className="mr-2 h-4 w-4" />
								<span>Log out</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</motion.header>

			<LogoutPopup open={showLogoutPopup} onOpenChange={setShowLogoutPopup} />
		</>
	);
}
