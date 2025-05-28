"use client";

import { motion } from "framer-motion";
import { Truck, Headphones, Heart, Shield } from "lucide-react";

export default function SupportSection() {
	const supportItems = [
		{
			icon: Truck,
			title: "FAST & FREE SHIPPING",
			description: "All Over India",
		},
		{
			icon: Headphones,
			title: "Give Us A Call",
			description: "+91 9945234161",
		},
		{
			icon: Heart,
			title: "Email Us",
			description: "hello@safetyonline.in",
		},
		{
			icon: Shield,
			title: "Locations",
			description: "Pan India Delivery",
		},
	];

	return (
		<section className="py-8 md:py-16 bg-gray-50">
			<div className="px-10">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
					{supportItems.map((item, index) => {
						const IconComponent = item.icon;
						return (
							<motion.div
								key={item.title}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.1 }}
								className="text-center bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
							>
								<div className="w-12 h-12 md:w-16 md:h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
									<IconComponent className="h-6 w-6 md:h-8 md:w-8 text-white" />
								</div>
								<h3 className="font-bold mb-2 text-sm md:text-base">
									{item.title}
								</h3>
								<p className="text-gray-600 text-xs md:text-sm">
									{item.description}
								</p>
							</motion.div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
