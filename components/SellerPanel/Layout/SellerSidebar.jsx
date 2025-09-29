"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarMenuSub,
	SidebarMenuSubItem,
	SidebarMenuSubButton,
	SidebarFooter,
	SidebarRail,
} from "@/components/ui/sidebar";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
        LayoutDashboard,
        Package,
        ShoppingCart,
        ChevronDown,
        Settings,
        Sun,
        Moon,
        ChartColumn,
        Undo2,
        Wallet,
} from "lucide-react";
import Logo from "@/public/SafetyLogo.png";

const menuItems = [
	{
		title: "Dashboard",
		icon: LayoutDashboard,
		href: "/seller/dashboard",
	},
	{
		title: "Products",
		icon: Package,
		href: "/seller/products",
	},
        {
                title: "Orders",
                icon: ShoppingCart,
                href: "/seller/orders",
        },
        {
                title: "Payments",
                icon: Wallet,
                href: "/seller/payments",
        },
        {
                title: "Order Returns",
                icon: Undo2,
		href: "/seller/returns",
	},
	{
		title: "Analytics & Reports",
		icon: ChartColumn,
		href: "/seller/analytics-report",
	},
	{
		title: "Account Settings",
		icon: Settings,
		href: "/seller/account-settings",
	},
];

export default function SellerSidebar() {
	const pathname = usePathname();
	const [theme, setTheme] = useState("light");

	const toggleTheme = () => {
		setTheme(theme === "light" ? "dark" : "light");
	};

	return (
		<Sidebar className="border-none bg-white">
			<SidebarHeader className="p-4 bg-white">
				<div className="flex items-center justify-center">
					<Link
						href="/seller/dashboard"
						className="flex items-center space-x-2"
					>
						<Image
							src={Logo}
							alt="Logo"
							className="h-auto w-20 lg:w-24 object-cover"
						/>
					</Link>
				</div>
			</SidebarHeader>

			<SidebarContent className="px-2 bg-white">
				<SidebarMenu>
					{menuItems.map((item) => {
						const isActive = item.items
							? item.items.some((subItem) => pathname.startsWith(subItem.href))
							: pathname === item.href;
						return (
							<SidebarMenuItem key={item.title}>
								{item.items ? (
									<Collapsible defaultOpen={isActive}>
										<CollapsibleTrigger asChild>
											<SidebarMenuButton
												className="w-full justify-between"
												isActive={isActive}
											>
												<div className="flex items-center gap-2">
													<item.icon className="w-4 h-4" />
													<span className="font-semibold">{item.title}</span>
												</div>
												<ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
											</SidebarMenuButton>
										</CollapsibleTrigger>
										<CollapsibleContent>
											<SidebarMenuSub>
												{item.items.map((subItem) => {
													const subItemActive = pathname.startsWith(
														subItem.href
													);
													return (
														<SidebarMenuSubItem key={subItem.title}>
															<SidebarMenuSubButton
																asChild
																isActive={subItemActive}
															>
																<Link
																	href={subItem.href}
																	className="flex items-center gap-2"
																>
																	<subItem.icon className="w-4 h-4" />
																	<span className="font-semibold">
																		{subItem.title}
																	</span>
																</Link>
															</SidebarMenuSubButton>
														</SidebarMenuSubItem>
													);
												})}
											</SidebarMenuSub>
										</CollapsibleContent>
									</Collapsible>
								) : (
									<SidebarMenuButton asChild isActive={isActive}>
										<Link href={item.href} className="flex items-center gap-2">
											<item.icon className="w-4 h-4" />
											<span className="font-semibold">{item.title}</span>
										</Link>
									</SidebarMenuButton>
								)}
							</SidebarMenuItem>
						);
					})}
				</SidebarMenu>
			</SidebarContent>

			{/* Theme Toggle */}
			<SidebarFooter className="p-4">
				<div className="flex gap-2">
					<Button
						variant={theme === "light" ? "default" : "outline"}
						size="sm"
						onClick={toggleTheme}
						className="flex-1"
					>
						<Sun className="w-4 h-4 mr-1" />
						Light
					</Button>
					<Button
						variant={theme === "dark" ? "default" : "outline"}
						size="sm"
						onClick={toggleTheme}
						className="flex-1"
					>
						<Moon className="w-4 h-4 mr-1" />
						Dark
					</Button>
				</div>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
