"use client";

import { motion } from "framer-motion";
import { Truck, Headphones, Shield } from "lucide-react";

export default function ServiceGuarantees() {
	const services = [
		{
			icon: Truck,
			title: "FREE AND FAST DELIVERY",
			description: "Free delivery for all orders",
		},
		{
			icon: Headphones,
			title: "24/7 CUSTOMER SERVICE",
			description: "Friendly 24/7 customer support",
		},
		{
			icon: Shield,
			title: "MONEY BACK GUARANTEE",
			description: "We return money within 30 days",
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
