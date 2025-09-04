"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MyProfile } from "@/components/BuyerPanel/account/tabs/MyProfile.jsx";
import { useIsAuthenticated } from "@/store/authStore";

const contentVariants = {
	initial: { opacity: 0, x: 20 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: -20 },
	transition: { duration: 0.3 },
};

export default function AccountPage() {
	const router = useRouter();
	const pathname = usePathname();
	const isAuthenticated = useIsAuthenticated();

	useEffect(() => {
	const protectedRoutes = ["/account/profile", "/account/help", "/account/orders"];

	if (protectedRoutes.some((route) => pathname.startsWith(route)) && !isAuthenticated) {
		router.replace("/login");
	} else if (pathname === "/account" && isAuthenticated) {
		router.replace("/account/profile");
	}
}, [pathname, isAuthenticated, router]);


	return (
		<AnimatePresence mode="wait">
			<motion.div {...contentVariants} className="w-full">
				<MyProfile />
			</motion.div>
		</AnimatePresence>
	);
}
