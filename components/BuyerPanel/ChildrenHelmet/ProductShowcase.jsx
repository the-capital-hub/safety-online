"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent } from "@/components/ui/card.jsx";
import {
	PinkHelmet,
	YellowHelmet,
	RedHelmet,
} from "@/public/images/children-helmet/index.js";

export default function ProductShowcase() {
	const products = [
		{
			name: "Scooter Helmets",
			price: "₹ 5,000",
			image: PinkHelmet.src,
			description:
				"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
		},
		{
			name: "Bicycle Helmets",
			price: "₹ 5,000",
			image: YellowHelmet.src,
			description:
				"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
		},
		{
			name: "Skating Helmets",
			price: "₹ 5,000",
			image: RedHelmet.src,
			description:
				"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
		},
	];

	return (
		<section className="py-10 bg-gradient-to-r from-purple-100 to-pink-100 overflow-hidden">
			<div className="px-10">
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="text-center mb-16"
				>
					<h2 className="text-4xl lg:text-6xl font-bold mb-4">
						Choose The Best
					</h2>
					<p className="max-w-2xl mx-auto text-lg">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
						eiusmod tempor incididunt ut labore et dolore magna aliqua.
					</p>
				</motion.div>

				<div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
					{products.map((product, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: index * 0.2 }}
						>
							<Card className="bg-background hover:shadow-lg transition-shadow duration-300">
								<CardContent className="p-6 text-center">
									<div className="mb-6">
										<img
											src={product.image || "/placeholder.svg"}
											alt={product.name}
											className="w-full h-64 object-contain mx-auto"
										/>
									</div>

									<h3 className="text-xl font-bold font-serif mb-2">
										{product.name}
									</h3>
									<div className="text-2xl font-bold text-primary mb-4">
										{product.price}
									</div>

									<p className="text-sm mb-6">{product.description}</p>

									<Button className="bg-amber-700 hover:bg-amber-800 w-fit mx-auto rounded-full">
										Buy Now
									</Button>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>

				{/* <motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center"
				>
					<Button
						variant="default"
						size="lg"
						className="bg-amber-700 hover:bg-amber-800 w-fit mx-auto rounded-full"
					>
						View all Helmets
					</Button>
				</motion.div> */}
			</div>
		</section>
	);
}
