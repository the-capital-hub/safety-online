"use client";

import { motion } from "framer-motion";
import { Truck, ShieldCheck, Headset } from "lucide-react";

export default function ServiceGuarantees() {
	const services = [
		{
			icon: Truck,
			title: "FAST DELIVERY",
			description: "We offer fast and reliable delivery",
		},
		{
			icon: Headset,
			title: "24/7 CUSTOMER SUPPORT",
			description: "Our customer support team is available 24/7",
		},
		{
			icon: ShieldCheck,
			title: "SECURE PAYMENTS",
			description: "Secure payment options for your convenience",
		},
	];

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
		>
			{services.map((service, index) => {
				const IconComponent = service.icon;
				return (
					<div key={service.title} className="text-center">
						<div className="w-12 h-12 md:w-16 md:h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
							<IconComponent className="h-6 w-6 md:h-8 md:w-8 text-white" />
						</div>
						<h3 className="font-bold mb-2 text-sm md:text-base">
							{service.title}
						</h3>
						<p className="text-gray-600 text-xs md:text-sm">
							{service.description}
						</p>
					</div>
				);
			})}
		</motion.div>
	);
}
