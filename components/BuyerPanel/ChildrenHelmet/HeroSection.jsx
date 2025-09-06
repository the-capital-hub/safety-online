"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Star } from "lucide-react";
import {
	HeroImg,
	HeroArrowImg,
	GreenHelmet,
	Avatar1,
	Avatar2,
	Avatar3,
} from "@/public/images/children-helmet/index.js";

export default function HeroSection() {
	return (
		<section
			id="home"
			className="bg-gray-50 py-10 flex flex-col justify-center"
		>
			<div className="px-10 lg:px-20">
				<div className="flex flex-col-reverse md:flex-row justify-between items-center">
					{/* Left Content */}
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8 }}
						className="flex-1 space-y-8"
					>
						<Badge className="w-fit py-2 rounded-full">
							⚡ 100% TRUSTED PLATFORM
						</Badge>

						<div className="space-y-4">
							<h1 className="text-4xl lg:text-8xl font-bold">
								LITTLE HEADS, BIG <br />
								ADVENTURES!
								<img
									src={GreenHelmet.src}
									alt="Green helmet"
									className="w-20 h-20 inline-block ml-2"
								/>
							</h1>

							<p className="text-lg max-w-xl">
							Meet India’s most lovable kids’ bike helmets – <b>Brave Blue Rider & Pretty Pink Explorer</b>.
							Safe. Stylish. Super fun to wear!
							</p>
						</div>

						{/* Category Pills */}
						<div className="flex justify-center md:justify-start flex-wrap gap-3">
							<span className="px-4 py-2 text-gray-300 text-lg font-bold">
								Scooter Helmets
							</span>
							<span className="px-4 py-2 text-sm font-bold">
								Bicycle Helmets
							</span>
							<span className="px-4 py-2 text-gray-300 text-lg font-bold">
								Skating Helmets
							</span>
						</div>

						{/* CTA and Reviews */}
						<div className="flex flex-col sm:flex-row items-center sm:items-center gap-6">
							<Button
								size="lg"
								className="bg-amber-700 hover:bg-amber-800 px-8 py-3 rounded-full"
							>
								Buy Now
							</Button>

							<div className="flex items-center gap-3">
								<div className="flex -space-x-2">
									<img
										src={Avatar1.src}
										alt="Customer"
										className="w-10 h-10 rounded-full border-2 border-background"
									/>
									<img
										src={Avatar2.src}
										alt="Customer"
										className="w-10 h-10 rounded-full border-2 border-background"
									/>
									<img
										src={Avatar3.src}
										alt="Customer"
										className="w-10 h-10 rounded-full border-2 border-background"
									/>
								</div>
								<div>
									<div className="flex items-center gap-1">
										{[...Array(5)].map((_, i) => (
											<Star key={i} className="w-4 h-4 fill-black text-black" />
										))}
									</div>
									<p className="text-sm">(10k+ Reviews)</p>
								</div>
							</div>
						</div>
					</motion.div>

					{/* Right Content - Hero Image */}
					<motion.div
						initial={{ opacity: 0, x: 50 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="mb-10 md:mb-0"
					>
						<img
							src={HeroImg.src}
							alt="Happy child wearing orange helmet"
							className="w-auto h-[500px] rounded-2xl"
						/>
					</motion.div>
				</div>
			</div>

			{/* Circular Badge */}
			<motion.div
				className="w-20 h-20 md:w-32 md:h-32 mx-auto animate-bounce hover:animate-none cursor-pointer mt-10 md:-mt-10"
				whileHover={{ scale: 1.1, duration: 0.2 }}
				whileTap={{ scale: 0.9, duration: 0.2 }}
			>
				<img
					src={HeroArrowImg.src}
					alt="Yellow helmet"
					className="w-full h-full"
				/>
			</motion.div>
		</section>
	);
}
