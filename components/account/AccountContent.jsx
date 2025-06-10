"use client";

import { motion, AnimatePresence } from "framer-motion";
import { OrderHistory } from "@/components/account/tabs/OrderHistory.jsx";
import { MyProfile } from "@/components/account/tabs/MyProfile.jsx";
import { PaymentOptions } from "@/components/account/tabs/PaymentOptions.jsx";
import { NotificationSettings } from "@/components/account/tabs/NotificationSettings.jsx";
import { HelpCenter } from "@/components/account/tabs/HelpCenter.jsx";

const contentVariants = {
	initial: { opacity: 0, x: 20 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: -20 },
	transition: { duration: 0.3 },
};

const tabComponents = {
	"order-history": OrderHistory,
	"my-profile": MyProfile,
	"payment-options": PaymentOptions,
	"notification-settings": NotificationSettings,
	"help-center": HelpCenter,
};

export function AccountContent({ activeTab }) {
	const ActiveComponent = tabComponents[activeTab];

	return (
		<div className="flex-1 min-h-[600px]">
			<AnimatePresence mode="wait">
				<motion.div key={activeTab} {...contentVariants} className="w-full">
					<ActiveComponent />
				</motion.div>
			</AnimatePresence>
		</div>
	);
}
