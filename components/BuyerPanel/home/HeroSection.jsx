"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
	ArrowRight,
	ChevronLeft,
	ChevronRight,
	ChevronDown,
} from "lucide-react";
import { HeroImg } from "@/public/images/home";

export default function HeroSection() {
	const router = useRouter();
	const sidebarCategories = [
		"SAFETY FIRST",
		"FIRST AID KIT",
		"HOME SAFETY",
		"CAR SAFETY",
	];

	return (
		<section className="relative bg-gray-100 overflow-hidden max-h-fit lg:max-h-[calc(100vh-136px)] h-full px-10">
			<div className="h-full flex flex-col lg:flex-row">
				{/* Main Hero Content */}
				<div className="h-full flex-1 py-8 lg:py-10 relative">
					<motion.h1
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="text-3xl md:text-4xl lg:text-8xl font-black leading-tight mb-6 lg:mb-8 absolute top-0 left-10 transform -translate-x-1/2 -translate-y-1/2 hidden md:block"
					>
						SAFETY GEAR,
					</motion.h1>
					<motion.h1
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="text-3xl md:text-4xl lg:text-8xl font-black leading-tight mb-6 lg:mb-8 absolute top-28 right-16 transform -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block"
					>
						SERIO
						<span className="text-black/50 stroke-white">US</span>{" "}
						<span className="text-black/50 stroke-white">P</span>
						ROTECTION
					</motion.h1>

					<motion.h1
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="text-3xl text-center font-black leading-tight mb-6 lg:mb-8 block md:hidden"
					>
						SAFETY GEAR, SERIOUS PROTECTION
					</motion.h1>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
						<div className="flex flex-col items-center lg:items-start lg:space-y-4 order-3 lg:order-1">
							{sidebarCategories.map((category, index) => (
								<motion.div
									key={category}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: index * 0.1 }}
								>
									<p
										className={`text-lg lg:text-2xl font-bold whitespace-nowrap lg:whitespace-normal ${
											index === 0 ? "text-black" : "text-gray-300"
										}`}
									>
										{category}
									</p>
								</motion.div>
							))}
						</div>

						<div className="order-2 lg:order-3">
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3, duration: 0.8 }}
								className="flex flex-col mb-0"
							>
								<p className="text-center md:text-left text-gray-600 mb-6 max-w-md text-sm md:text-base">
									Safety is the most basic yet the most important rule of life.
									It is the sum of safety precautions that determines the safety
									of the people working near you.
								</p>
								<Button
									className="bg-black text-white px-6 md:px-8 py-2 md:py-3 rounded-full w-full md:w-fit"
									onClick={() => router.push("/products")}
								>
									BUY NOW
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</motion.div>
						</div>

						<motion.div
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.5, duration: 0.8 }}
							className="relative order-1 lg:order-2"
						>
							<Image
								src={HeroImg.src}
								width={600}
								height={600}
								alt="Safety Professional"
								className="w-full h-auto max-h-96 lg:max-h-none object-cover rounded-lg lg:rounded-none"
							/>
						</motion.div>
					</div>
				</div>
			</div>

			{/* Scroll Down Indicator */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1 }}
				className="flex justify-center lg:absolute bottom-4 lg:bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce"
			>
				<div className="rounded-full bg-black text-white">
					<ChevronDown className="h-8 w-8" />
				</div>
			</motion.div>
		</section>
	);
}
