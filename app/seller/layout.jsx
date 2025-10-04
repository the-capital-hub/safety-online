"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import SellerHeader from "@/components/SellerPanel/Layout/Header.jsx";
import SellerFooter from "@/components/SellerPanel/Layout/Footer.jsx";
import SellerHeader2 from "@/components/SellerPanel/Layout/SellerHeader.jsx";
import SellerSidebar from "@/components/SellerPanel/Layout/SellerSidebar.jsx";
import LoadingSpinner from "@/components/SellerPanel/Layout/LoadingSpinner.jsx";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function SellerLayout({ children }) {
	const pathname = usePathname();
	const show = pathname === "/seller";
        const authOnlyRoutes = [
                "/seller/login",
                "/seller/register",
                "/seller/forgot-password",
        ];
        const hide = authOnlyRoutes.includes(pathname);

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
