"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import Logo from "@/public/SafetyLogo.png";
import { useIsAuthenticated } from "@/store/adminAuthStore.js";

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
			// { title: "Attributes", href: "/admin/catalog/attributes", icon: Layers },
			{ title: "Coupons", href: "/admin/catalog/coupons", icon: Ticket },
		],
	},
	{
		title: "Customers",
		icon: Users,
		href: "/admin/customers",
	},
	{
		title: "Sellers",
		icon: Users,
		href: "/admin/sellers",
	},
	{
		title: "Orders",
		icon: ShoppingCart,
		href: "/admin/orders",
	},
	// {
	// 	title: "Our Staff",
	// 	icon: UserCheck,
	// 	href: "/admin/our-staff",
	// },
	// {
	// 	title: "Settings",
	// 	icon: Settings,
	// 	href: "/admin/settings",
	// },
	// {
	// 	title: "International",
	// 	icon: Globe,
	// 	items: [
	// 		{
	// 			title: "Languages",
	// 			href: "/admin/international/languages",
	// 			icon: Languages,
	// 		},
	// 		{
	// 			title: "Currencies",
	// 			href: "/admin/international/currencies",
	// 			icon: DollarSign,
	// 		},
	// 	],
	// },
	// {
	// 	title: "Online Store",
	// 	icon: Store,
	// 	items: [
	// 		{ title: "View Store", href: "/admin/store/view", icon: Eye },
	// 		{
	// 			title: "Store Customizations",
	// 			href: "/admin/store/customizations",
	// 			icon: Palette,
	// 		},
	// 		{ title: "Store Settings", href: "/admin/store/settings", icon: Cog },
	// 	],
	// },
	// {
	// 	title: "Sellers Support",
	// 	icon: HelpCircle,
	// 	href: "/admin/sellers-support",
	// },
];

export function AdminSidebar() {
	const pathname = usePathname();
	const [theme, setTheme] = useState("light");
	const isAuthenticated = useIsAuthenticated();
	const router = useRouter();

	const toggleTheme = () => {
		setTheme(theme === "light" ? "dark" : "light");
	};

	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/admin/login");
		}
	}, [isAuthenticated, router]);

	if (!isAuthenticated) {
		return null;
	}

	return (
		<Sidebar className="border-none bg-white">
			<SidebarHeader className="p-4 bg-white">
				<div className="flex items-center justify-center">
					<Link href="/admin/dashboard" className="flex items-center space-x-2">
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

			{/* <SidebarFooter className="p-4">
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
			</SidebarFooter> */}
			<SidebarRail />
		</Sidebar>
	);
}
