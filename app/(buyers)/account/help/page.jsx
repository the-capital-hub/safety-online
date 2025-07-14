"use client";

import { motion, AnimatePresence } from "framer-motion";
import { HelpCenter } from "@/components/BuyerPanel/account/tabs/HelpCenter.jsx";

const contentVariants = {
	initial: { opacity: 0, x: 20 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: -20 },
	transition: { duration: 0.3 },
};

export default function HelpPage() {
	return (
		<AnimatePresence mode="wait">
			<motion.div {...contentVariants} className="w-full">
				<HelpCenter />
			</motion.div>
		</AnimatePresence>
	);
}
