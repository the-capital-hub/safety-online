"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MyProfile } from "@/components/BuyerPanel/account/tabs/MyProfile.jsx";

const contentVariants = {
	initial: { opacity: 0, x: 20 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: -20 },
	transition: { duration: 0.3 },
};

export default function AccountPage() {
	const router = useRouter();

	// Redirect to profile page by default
	useEffect(() => {
		router.replace("/account/profile");
	}, [router]);

	return (
		<AnimatePresence mode="wait">
			<motion.div {...contentVariants} className="w-full">
				<MyProfile />
			</motion.div>
		</AnimatePresence>
	);
}
