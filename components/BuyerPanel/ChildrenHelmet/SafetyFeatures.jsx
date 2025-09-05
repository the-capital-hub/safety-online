"use client";
import { motion } from "framer-motion";
import { OrangeHelmet } from "@/public/images/children-helmet/index.js";

export default function SafetyFeatures() {
	const features = [
		{
			title: " Impact-Absorbing Shell",
			description:
				"Strong outer layer for maximum safety",
			position: { top: "20%", right: "10%" },
		},
		{
			title: "Cushioned Inner Foam",
			description:
				"Soft padding for extra comfort",
			position: { top: "50%", right: "13%" },
		},
		{
			title: "Shock Absorption",
			description:
				"Reduces head injuries during falls",
			position: { top: "60%", left: "5%" },
		},
		{
			title: "Adjustable Fit",
			description: " Available in Small (3–6 yrs) & Medium (7–12 yrs)",
			position: { bottom: "5%", right: "30%" },
		},
		{
			title: "Fun Characters",
			description: "Helmets kids actually want to wear",
			position: { top: "27%", left: "15%" },
		},
	];

	return (
		<section
			id="safety"
			className="py-10 pt-20 bg-gradient-to-b from-orange-100 to-orange-50 overflow-hidden"
		>
			<div className="px-10">
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="text-center"
				>
					<h2 className="text-4xl lg:text-6xl font-bold mb-4">
						Safety Helmet Protection
					</h2>
				</motion.div>

				<div className="relative max-w-6xl mx-auto">
					{/* Central Helmet Image */}
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						whileInView={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.8 }}
						className="relative z-10"
					>
						<img
							src={OrangeHelmet.src}
							alt="Orange safety helmet with features highlighted"
							className="w-full h-auto max-w-2xl mx-auto"
						/>
					</motion.div>

					{/* Feature Callouts */}
					{features.map((feature, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, scale: 0 }}
							whileInView={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.6, delay: index * 0.2 }}
							className="absolute hidden lg:block"
							style={feature.position}
						>
							<div className="bg-amber-700 text-white px-4 py-2 rounded-full text-lg font-medium whitespace-nowrap relative">
								{feature.title}
								<div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-card-foreground p-3 rounded-lg max-w-xs text-sm">
									{feature.description}
								</div>
							</div>
						</motion.div>
					))}

					{/* Mobile Feature List */}
					<div className="lg:hidden mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
						{features.map((feature, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: index * 0.1 }}
								className="bg-card p-4 rounded-lg"
							>
								<h3 className="font-semibold text-primary mb-2">
									{feature.title}
								</h3>
								<p className="text-sm text-muted-foreground">
									{feature.description}
								</p>
							</motion.div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
