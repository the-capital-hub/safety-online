"use client";

import { motion, AnimatePresence } from "framer-motion";
import { OrderHistory } from "@/components/account/tabs/OrderHistory.jsx";

const contentVariants = {
	initial: { opacity: 0, x: 20 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: -20 },
	transition: { duration: 0.3 },
};

export default function OrdersPage() {
	return (
		<AnimatePresence mode="wait">
			<motion.div {...contentVariants} className="w-full">
				<OrderHistory />
			</motion.div>
		</AnimatePresence>
	);
}
