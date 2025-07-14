"use client";

import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminPanel/AdminSidebar.jsx";
import { AdminHeader } from "@/components/AdminPanel/AdminHeader.jsx";

export default function AdminLayout({ children }) {
	return (
		<SidebarProvider defaultOpen={true}>
			<div className="w-full min-h-screen flex bg-gray-50">
				<AdminSidebar />
				<div className="flex flex-col flex-1 min-h-screen">
					{/* Fixed Header */}
					<div className="sticky top-0 z-10">
						<AdminHeader />
					</div>

					{/* Scrollable Content */}
					<motion.main
						className="flex-1 p-6 overflow-y-auto overflow-x-hidden"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
					>
						{children}
					</motion.main>
				</div>
			</div>
			<Toaster />
		</SidebarProvider>
	);
}
