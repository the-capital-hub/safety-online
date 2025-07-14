"use client";

import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { Package, User, CreditCard, Bell, HelpCircle } from "lucide-react";

const sidebarItems = [
	{
		id: "my-profile",
		title: "My Profile",
		icon: User,
		description: "Personal information & addresses",
		href: "/account/profile",
	},
	{
		id: "order-history",
		title: "Order History",
		icon: Package,
		description: "View your past orders",
		href: "/account/orders",
	},
	{
		id: "payment-options",
		title: "Payment Options",
		icon: CreditCard,
		description: "Cards, wallets & UPI",
		href: "/account/payment",
	},
	{
		id: "notification-settings",
		title: "Notification Settings",
		icon: Bell,
		description: "Manage your notifications",
		href: "/account/notifications",
	},
	{
		id: "help-center",
		title: "Help Center",
		icon: HelpCircle,
		description: "Get help & support",
		href: "/account/help",
	},
];

const itemVariants = {
	hidden: { opacity: 0, x: -20 },
	visible: (i) => ({
		opacity: 1,
		x: 0,
		transition: {
			delay: i * 0.1,
			duration: 0.5,
		},
	}),
};

export function AccountSidebar({ activeTab, onTabChange }) {
	const router = useRouter();
	const pathname = usePathname();

	const handleTabClick = (item) => {
		onTabChange(item.id);
		router.push(item.href);
	};

	const isActive = (item) => {
		if (pathname === "/account" && item.id === "my-profile") {
			return true;
		}
		return pathname === item.href || activeTab === item.id;
	};

	return (
		<div className="fixed left-0 top-[68px] w-72 h-[calc(100vh-68px)] bg-white border-r border-gray-200 overflow-y-auto z-10">
			<div className="px-6 py-8">
				<nav className="space-y-2">
					{sidebarItems.map((item, index) => (
						<motion.div
							key={item.id}
							custom={index}
							initial="hidden"
							animate="visible"
							variants={itemVariants}
						>
							<button
								onClick={() => handleTabClick(item)}
								className={`w-full text-left p-4 rounded-lg transition-all duration-200 group hover:bg-gray-50 ${
									isActive(item)
										? "bg-yellow-50 border-l-4 border-l-yellow-600"
										: "hover:bg-gray-50"
								}`}
							>
								<div className="flex items-center gap-3 mb-1">
									<item.icon
										className={`h-5 w-5 transition-colors ${
											isActive(item)
												? "text-yellow-600"
												: "text-gray-500 group-hover:text-gray-700"
										}`}
									/>
									<span
										className={`font-medium transition-colors ${
											isActive(item)
												? "text-yellow-900"
												: "text-gray-900 group-hover:text-gray-900"
										}`}
									>
										{item.title}
									</span>
								</div>
								<p
									className={`text-sm ml-8 transition-colors ${
										isActive(item)
											? "text-yellow-700"
											: "text-gray-500 group-hover:text-gray-600"
									}`}
								>
									{item.description}
								</p>
							</button>
						</motion.div>
					))}
				</nav>
			</div>
		</div>
	);
}
