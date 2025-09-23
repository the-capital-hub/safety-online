"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { NotificationDropdown } from "@/components/SellerPanel/Layout/NotificationDropdown.jsx";
import { LogoutPopup } from "@/components/Shared/Popups/LogoutPopup.jsx";
import {
	useSellerFullName,
	useSellerEmail,
	useSellerProfilePic,
	useIsSellerAuthenticated,
} from "@/store/sellerAuthStore.js";

export default function SellerHeader() {
	const router = useRouter();
	const [showLogoutPopup, setShowLogoutPopup] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const fullName = useSellerFullName();
	const email = useSellerEmail();
	const profilePic = useSellerProfilePic();
	const isAuthenticated = useIsSellerAuthenticated();

	// console.log("fullName:", fullName);
	// console.log("email:", email);
	// console.log("profilePic:", profilePic);
	// console.log("isAuthenticated:", isAuthenticated);

	const handleProfileClick = () => {
		if (isAuthenticated) {
			router.push("/seller/personal-settings");
		} else {
			router.push("/seller/login");
		}
	};

	const handleAccountClick = () => {
		if (isAuthenticated) {
			router.push("/seller/account-settings");
		} else {
			router.push("/seller/login");
		}
	};

	return (
		<>
			<motion.header
				className="flex items-center justify-between py-4 px-6 bg-white"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				{/* Left side: Sidebar + Search */}
				<div className="flex items-center gap-4">
					<SidebarTrigger />
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
						<Input name="searchQuery"
							placeholder="Search"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 w-80"
						/>
					</div>
				</div>

				{/* Right side: Notifications + Profile */}
				<div className="flex items-center gap-4">
					<NotificationDropdown />

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="relative h-8 w-8 rounded-full">
								<Avatar className="h-8 w-8">
									<AvatarImage src={profilePic} alt="Admin" />
									<AvatarFallback>SP</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent className="w-56" align="end" forceMount>
							{/* User Info Header */}
							<div className="flex items-center gap-3 p-3">
								<Avatar className="h-10 w-10">
									<AvatarImage src={profilePic} alt={fullName || "Admin"} />
									<AvatarFallback>
										{fullName ? fullName.charAt(0) : "A"}
									</AvatarFallback>
								</Avatar>
								<div className="flex flex-col">
									<span className="font-medium">
										{fullName || "Seller User"}
									</span>
									<span className="text-xs text-muted-foreground">
										{email || "seller@example.com"}
									</span>
								</div>
							</div>
							<DropdownMenuSeparator />

							<DropdownMenuItem
								className="cursor-pointer"
								onClick={handleProfileClick}
							>
								<User className="mr-2 h-4 w-4" />
								<span>Profile settings</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								className="cursor-pointer"
								onClick={handleAccountClick}
							>
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
