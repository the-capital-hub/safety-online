"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import SellerHeader from "@/components/SellerPanel/Header.jsx";
import SellerFooter from "@/components/SellerPanel/Footer.jsx";
import SellerHeader2 from "@/components/SellerPanel/SellerHeader.jsx";
import SellerSidebar from "@/components/SellerPanel/SellerSidebar.jsx";
import LoadingSpinner from "@/components/SellerPanel/LoadingSpinner.jsx";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function SellerLayout({ children }) {
	const pathname = usePathname();
	const show = pathname === "/seller";
	const hide = pathname === "/seller/login" || pathname === "/seller/register";

	// If on login or register page, render minimal layout
	if (hide) {
		return (
			<div className="min-h-screen">
				<main>
					<Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
				</main>
			</div>
		);
	}

	return (
		<SidebarProvider defaultOpen={true}>
			{!show && <SellerSidebar />}
			<div className="min-h-screen flex-1">
				{/* Fixed Header */}
				<div className="sticky top-0 z-50">
					<Suspense fallback={<LoadingSpinner />}>
						{show ? <SellerHeader /> : <SellerHeader2 />}
					</Suspense>
				</div>

				<main className="relative">
					<Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
				</main>

				<Suspense fallback={<LoadingSpinner />}>
					{show && <SellerFooter />}
				</Suspense>
			</div>
		</SidebarProvider>
	);
}
