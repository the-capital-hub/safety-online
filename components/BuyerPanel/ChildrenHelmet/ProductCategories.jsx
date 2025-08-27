"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button.jsx";
import {
	ReduceImpactImg,
	YellowHelmet,
	PinkHelmet,
} from "@/public/images/children-helmet/index.js";

export default function ProductCategories() {
	return (
		<section
			id="products"
			className="py-10 bg-gradient-to-r from-purple-100 to-pink-100 overflow-hidden"
		>
			<div className="px-10">
				{/* Title */}
				<motion.div
					initial={{ opacity: 0, x: 50 }}
					whileInView={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
					className="flex flex-col md:flex-row justify-center items-center gap-5"
				>
					{/* Floating helmet */}
					<motion.div
						animate={{ rotate: [0, 10, -10, 0] }}
						transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
					>
						<img
							src={YellowHelmet.src}
							alt="Yellow helmet"
							className="w-20 h-20"
						/>
					</motion.div>

					<h2 className="text-4xl text-center lg:text-6xl font-bold">
						Reduce Impact To The Head
					</h2>

					{/* Floating helmet */}
					<motion.div
						animate={{ rotate: [0, -10, 10, 0] }}
						transition={{
							duration: 4,
							repeat: Number.POSITIVE_INFINITY,
							delay: 2,
						}}
						className="hidden md:block"
					>
						<img src={PinkHelmet.src} alt="Pink helmet" className="w-20 h-20" />
					</motion.div>
				</motion.div>

				{/* Content */}
				<div className="grid lg:grid-cols-2 gap-12 items-center">
					{/* Left Content - Image */}
					<motion.div
						initial={{ opacity: 0, x: 50 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8 }}
						className="relative"
					>
						<img
							src={ReduceImpactImg.src}
							alt="Child with green helmet giving thumbs up"
							className="w-full h-auto rounded-2xl"
						/>
					</motion.div>

					{/* Right Content */}
					<motion.div
						initial={{ opacity: 0, x: 50 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="space-y-8"
					>
						<div className="space-y-4">
							<div className="space-y-2">
								<h3 className="text-xl font-semibold">
									SAFE HELMET FOR YOUR CHILDREN'S
								</h3>
								<p className="text-lg">
									Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
									do eiusmod tempor incididunt ut labore et dolore magna aliqua.
								</p>
							</div>
						</div>

						{/* Category Buttons */}
						<div className="flex flex-wrap gap-3">
							<Button
								variant="default"
								className="bg-amber-700 hover:bg-amber-800 rounded-full px-6"
							>
								Scooter Helmets
							</Button>
							<Button variant="outline" className="rounded-full px-6 bg-white">
								Skating Helmets
							</Button>
							<Button variant="outline" className="rounded-full px-6 bg-white">
								Helmets
							</Button>
							<Button variant="outline" className="rounded-full px-6 bg-white">
								Bicycle Helmets
							</Button>
						</div>

						{/* Price and CTA */}
						<div className="space-y-4">
							<div>
								<h3 className="text-lg font-semibold mb-2">
									SAFE HELMET IS MAIN IMPORTANT FOR YOUR CHILDREN'S
								</h3>
								<div className="text-3xl font-bold text-primary">₹ 5,000</div>
							</div>

							<Button
								size="lg"
								className="bg-amber-700 hover:bg-amber-800 px-8 rounded-full"
							>
								Buy Now
							</Button>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
