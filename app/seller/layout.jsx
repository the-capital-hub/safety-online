"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import Header from "@/components/BuyerPanel/Header.jsx";
import Footer from "@/components/BuyerPanel/Footer.jsx";
import SellerHeader from "@/components/SellerPanel/Layout/SellerHeader.jsx";
import SellerSidebar from "@/components/SellerPanel/Layout/SellerSidebar.jsx";
import LoadingSpinner from "@/components/SellerPanel/Layout/LoadingSpinner.jsx";
import { SidebarProvider } from "@/components/ui/sidebar";
import Script from "next/script";

export default function SellerLayout({ children }) {
        const pathname = usePathname();
        const isLandingPage = pathname === "/seller";
        const authOnlyRoutes = [
                "/seller/login",
                "/seller/register",
                "/seller/forgot-password",
        ];
        const hide = authOnlyRoutes.includes(pathname);
        const tawkScript = (
                <Script id="tawk-to" strategy="afterInteractive">
                        {`
                                var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
                                (function () {
                                        var s1 = document.createElement("script"),
                                                s0 = document.getElementsByTagName("script")[0];
                                        s1.async = true;
                                        s1.src = "https://embed.tawk.to/68f50287a86dab1951b97b79/1j7uh3olq";
                                        s1.charset = "UTF-8";
                                        s1.setAttribute("crossorigin", "*");
                                        s0.parentNode.insertBefore(s1, s0);
                                })();
                        `}
                </Script>
        );

        // If on login or register page, render minimal layout
        if (hide) {
                return (
                        <div className="min-h-screen">
                                {tawkScript}
                                <main>
                                        <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
                                </main>
			</div>
		);
        }

        return (
                <SidebarProvider defaultOpen={true}>
                        {tawkScript}
                        {!isLandingPage && <SellerSidebar />}
                        <div className="min-h-screen flex-1">
                                {/* Fixed Header */}
                                <div className={isLandingPage ? undefined : "sticky top-0 z-50"}>
                                        <Suspense fallback={<LoadingSpinner />}>
                                                {isLandingPage ? <Header /> : <SellerHeader />}
                                        </Suspense>
                                </div>

                                <main className="relative">
                                        <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
                                </main>

                                <Suspense fallback={<LoadingSpinner />}>
                                        {isLandingPage && <Footer />}
                                </Suspense>
                        </div>
                </SidebarProvider>
        );
}
