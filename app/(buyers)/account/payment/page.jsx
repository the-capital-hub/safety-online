"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PaymentOptions } from "@/components/BuyerPanel/account/tabs/PaymentOptions.jsx";

const contentVariants = {
	initial: { opacity: 0, x: 20 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: -20 },
	transition: { duration: 0.3 },
};

export default function PaymentPage() {
	return (
		<AnimatePresence mode="wait">
			<motion.div {...contentVariants} className="w-full">
				<PaymentOptions />
			</motion.div>
		</AnimatePresence>
	);
}
