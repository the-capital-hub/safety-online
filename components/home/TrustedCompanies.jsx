"use client";

import { motion } from "framer-motion";

export default function TrustedCompanies() {
	const companyLogos = [
		"Ansell",
		"3M",
		"DeWalt",
		"Fiberloc",
		"Dräger",
		"Honeywell",
	];

	return (
		<section className="py-8 md:py-10 bg-gray-50">
			<div className="px-10">
				<motion.h2
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12"
				>
					Trusted By Top Companies
				</motion.h2>
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-8">
					{companyLogos.map((logo, index) => (
						<motion.div
							key={logo}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: index * 0.1 }}
							className="flex items-center justify-center p-4 md:p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
						>
							<span className="text-lg md:text-2xl font-bold text-gray-400">
								{logo}
							</span>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
