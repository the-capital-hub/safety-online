"use client";

import { useState } from "react";
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
	Users,
	ShoppingCart,
	UserCheck,
	Settings,
	Globe,
	Store,
	HelpCircle,
	ChevronDown,
	Sun,
	Moon,
	FolderOpen,
	Tags,
	Layers,
	Ticket,
	Languages,
	DollarSign,
	Eye,
	Palette,
	Cog,
} from "lucide-react";

const menuItems = [
	{
		title: "Dashboard",
		icon: LayoutDashboard,
		href: "/admin/dashboard",
	},
	{
		title: "Catalog",
		icon: Package,
		items: [
			{ title: "Products", href: "/admin/catalog/products", icon: FolderOpen },
			{ title: "Categories", href: "/admin/catalog/categories", icon: Tags },
			{ title: "Attributes", href: "/admin/catalog/attributes", icon: Layers },
			{ title: "Coupons", href: "/admin/catalog/coupons", icon: Ticket },
		],
	},
	{
		title: "Customers",
		icon: Users,
		href: "/admin/customers",
	},
	{
		title: "Orders",
		icon: ShoppingCart,
		href: "/admin/orders",
	},
	{
		title: "Our Staff",
		icon: UserCheck,
		href: "/admin/our-staff",
	},
	{
		title: "Settings",
		icon: Settings,
		href: "/admin/settings",
	},
	{
		title: "International",
		icon: Globe,
		items: [
			{
				title: "Languages",
				href: "/admin/international/languages",
				icon: Languages,
			},
			{
				title: "Currencies",
				href: "/admin/international/currencies",
				icon: DollarSign,
			},
		],
	},
	{
		title: "Online Store",
		icon: Store,
		items: [
			{ title: "View Store", href: "/admin/store/view", icon: Eye },
			{
				title: "Store Customizations",
				href: "/admin/store/customizations",
				icon: Palette,
			},
			{ title: "Store Settings", href: "/admin/store/settings", icon: Cog },
		],
	},
	{
		title: "Help & getting started",
		icon: HelpCircle,
		href: "/admin/help",
	},
];

export function AdminSidebar() {
	const pathname = usePathname();
	const [theme, setTheme] = useState("light");

	const toggleTheme = () => {
		setTheme(theme === "light" ? "dark" : "light");
	};

	return (
		<Sidebar className="border-none bg-white">
			<SidebarHeader className="p-4 bg-white">
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 bg-black rounded flex items-center justify-center">
						<span className="text-white font-bold text-sm">S</span>
					</div>
					<div>
						<h2 className="font-bold text-lg">SAFETY</h2>
						<p className="text-xs text-gray-500">ONLINE</p>
					</div>
				</div>
			</SidebarHeader>

			<SidebarContent className="px-2 bg-white">
				<SidebarMenu>
					{menuItems.map((item) => (
						<SidebarMenuItem key={item.title}>
							{item.items ? (
								<Collapsible defaultOpen={item.title === "Catalog"}>
									<CollapsibleTrigger asChild>
										<SidebarMenuButton className="w-full justify-between">
											<div className="flex items-center gap-2">
												<item.icon className="w-4 h-4" />
												<span className="font-semibold">{item.title}</span>
											</div>
											<ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
										</SidebarMenuButton>
									</CollapsibleTrigger>
									<CollapsibleContent>
										<SidebarMenuSub>
											{item.items.map((subItem) => (
												<SidebarMenuSubItem key={subItem.title}>
													<SidebarMenuSubButton
														asChild
														isActive={pathname === subItem.href}
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
											))}
										</SidebarMenuSub>
									</CollapsibleContent>
								</Collapsible>
							) : (
								<SidebarMenuButton asChild isActive={pathname === item.href}>
									<Link href={item.href} className="flex items-center gap-2">
										<item.icon className="w-4 h-4" />
										<span className="font-semibold">{item.title}</span>
									</Link>
								</SidebarMenuButton>
							)}
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarContent>

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
