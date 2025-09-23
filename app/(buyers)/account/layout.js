"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { AccountSidebar } from "@/components/BuyerPanel/account/AccountSidebar.jsx";
import { useAuthStore, useIsAuthenticated } from "@/store/authStore";

const fadeInUp = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.5 },
};

export default function AccountLayout({ children }) {
        const [activeTab, setActiveTab] = useState("my-profile");
        const [isClient, setIsClient] = useState(false);
        const [hasHydrated, setHasHydrated] = useState(false);
        const pathname = usePathname();
        const router = useRouter();
        const isAuthenticated = useIsAuthenticated();

        useEffect(() => {
                setIsClient(true);
        }, []);

        useEffect(() => {
                const persist = useAuthStore.persist;

                if (!persist?.hasHydrated) {
                        setHasHydrated(true);
                        return;
                }

                if (persist.hasHydrated()) {
                        setHasHydrated(true);
                }

                const unsub = persist.onFinishHydration?.(() => {
                        setHasHydrated(true);
                });

                return () => {
                        if (typeof unsub === "function") {
                                unsub();
                        }
                };
        }, []);

        useEffect(() => {
                if (isClient && hasHydrated && !isAuthenticated) {
                        router.replace("/login");
                }
        }, [hasHydrated, isAuthenticated, isClient, router]);

        useEffect(() => {
                if (pathname && isClient) {
                        const urlToTabMap = {
                                "/account": "my-profile",
				"/account/profile": "my-profile",
				"/account/orders": "order-history",
				"/account/payment": "payment-options",
				"/account/notifications": "notification-settings",
				"/account/help": "help-center",
			};

			const matchedTab = urlToTabMap[pathname];
			if (matchedTab) {
				setActiveTab(matchedTab);
                        }
                }
        }, [pathname, isClient]);

        if (!isClient || !hasHydrated) {
                return (
                        <div className="h-[calc(100vh-68px)] bg-gray-50">
                                {/* Desktop loading sidebar */}
                                <div className="hidden md:block fixed left-0 top-0 w-72 h-[calc(100vh-68px)] bg-white border-r border-gray-200">
                                        <div className="p-6">Loading...</div>
				</div>
				<div className="md:ml-72">
                                        <div className="h-[calc(100vh-68px)] overflow-y-auto">
                                                <div className="p-8">{children}</div>
                                        </div>
                                </div>
                        </div>
                );
        }

        if (hasHydrated && !isAuthenticated) {
                return (
                        <div className="h-[calc(100vh-68px)] bg-gray-50">
                                <div className="flex h-full items-center justify-center p-6 text-gray-600">
                                        Redirecting to login...
                                </div>
                        </div>
                );
        }

	return (
		<div className="h-[calc(100vh-68px)] bg-gray-50">
			{/* Sidebar handles mobile + desktop itself */}
			<AccountSidebar activeTab={activeTab} onTabChange={setActiveTab} />

			{/* Content area: full width on mobile, pushed right on desktop */}
			<div className="md:ml-72">
				<div className="h-[calc(100vh-68px)] overflow-y-auto hide-scrollbar">
					<motion.div className="p-4 md:p-8" {...fadeInUp}>
						{children}
					</motion.div>
				</div>
			</div>
		</div>
	);
}
