"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button.jsx";
import {
	GreenHelmet,
	PreventCollisionImg,
	PinkHelmet,
} from "@/public/images/children-helmet/index.js";

export default function CollisionPreventionSection() {
	return (
		<section className="py-6 sm:py-8 lg:py-10 bg-amber-50 overflow-hidden">
			<div className="px-4 sm:px-6 lg:px-10">
				{/* Title and Description */}
				<motion.div
					initial={{ opacity: 0, x: -50 }}
					whileInView={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6 }}
					viewport={{ once: true }}
					className="w-full flex flex-col md:flex-row gap-4 sm:gap-6 text-center md:text-left justify-between items-center mb-6 sm:mb-8 lg:mb-10"
				>
					<h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
						Prevent Collisions From
						<br className="hidden sm:block" />
						<span className="sm:hidden"> </span>
						Happening
					</h2>

					<p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xs sm:max-w-md px-2 sm:px-0">
					Every helmet is ISI certified and built with high-impact technology that protects kids from bumps, falls, and collisions. With a snug, adjustable fit, parents can breathe easy knowing their child’s head is always protected.
					</p>
				</motion.div>

				{/* Mobile Layout */}
				<motion.div
					className="block lg:hidden space-y-6 sm:space-y-8"
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					transition={{ duration: 0.3 }}
					viewport={{ once: true, margin: "-50px" }}
				>
					{/* Mobile Center Image */}
					<motion.div
						initial={{ opacity: 0, scale: 0.8, y: 30 }}
						whileInView={{ opacity: 1, scale: 1, y: 0 }}
						transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
						viewport={{ once: true, margin: "-100px" }}
						className="flex justify-center"
					>
						<motion.div
							className="w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden bg-white shadow-2xl"
							whileHover={{ scale: 1.05 }}
							transition={{ duration: 0.3 }}
						>
							<img
								src={PreventCollisionImg.src}
								alt="Child wearing blue helmet with skateboard"
								className="w-full h-full object-cover"
							/>
						</motion.div>
					</motion.div>

					{/* Mobile Helmets Row */}
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
						viewport={{ once: true, margin: "-50px" }}
						className="flex justify-center gap-4 sm:gap-8"
					>
						<motion.div
							className="flex justify-center items-center bg-white rounded-full p-4 sm:p-6 shadow-lg"
							initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
							whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
							transition={{ duration: 0.5, delay: 0.4 }}
							whileHover={{ scale: 1.1, rotate: 5 }}
							viewport={{ once: true }}
						>
							<img
								src={GreenHelmet.src}
								alt="Green helmet"
								className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
							/>
						</motion.div>
						<motion.div
							className="flex justify-center items-center bg-white rounded-full p-4 sm:p-6 shadow-lg"
							initial={{ opacity: 0, scale: 0.5, rotate: 10 }}
							whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
							transition={{ duration: 0.5, delay: 0.5 }}
							whileHover={{ scale: 1.1, rotate: -5 }}
							viewport={{ once: true }}
						>
							<img
								src={PinkHelmet.src}
								alt="Pink unicorn helmet"
								className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
							/>
						</motion.div>
					</motion.div>

					{/* Mobile Safety Text */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
						viewport={{ once: true, margin: "-50px" }}
						className="text-center px-4"
					>
						<motion.p
							className="text-lg sm:text-xl font-bold text-amber-900 leading-tight mb-4 sm:mb-6"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.7 }}
							viewport={{ once: true }}
						>
							HENCE IT IS CONSIDERED THE
							<br />
							SAFETY TYPE OF HELMET TO
							<br />
							PROTECT
						</motion.p>

						<motion.div
							initial={{ opacity: 0, scale: 0.8 }}
							whileInView={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.4, delay: 0.8 }}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							viewport={{ once: true }}
						>
							<Button className="bg-orange-600 hover:bg-orange-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold transition-all duration-300 mb-4 sm:mb-6">
								Buy Now
							</Button>
						</motion.div>

						<motion.p
							className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-sm mx-auto"
							initial={{ opacity: 0, y: 15 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.9 }}
							viewport={{ once: true }}
						>
							Every helmet is ISI certified and built with high-impact technology that protects kids from bumps, falls, and collisions.
						</motion.p>
					</motion.div>
				</motion.div>

				{/* Desktop Layout */}
				<div className="hidden lg:grid lg:grid-cols-4 items-center">
					{/* Left Content */}
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
						className="space-y-8 col-span-1"
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.8 }}
							whileInView={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							viewport={{ once: true }}
							className="flex justify-center items-center bg-white rounded-full py-16 px-6 w-fit ml-10 shadow-lg"
						>
							<img
								src={GreenHelmet.src}
								alt="Green helmet"
								className="w-32 h-32 object-contain"
							/>
						</motion.div>

						<div className="space-y-2">
							<p className="text-xl lg:text-2xl font-bold text-amber-900 leading-tight">
								HENCE IT IS
								<br />
								CONSIDERED THE
								<br />
								SAFETY TYPE OF
								<br />
								HELMET TO
								<br />
								PROTECT
							</p>
						</div>
					</motion.div>

					{/* Mid Content */}
					<motion.div
						initial={{ opacity: 0, x: 50 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.3 }}
						viewport={{ once: true }}
						className="col-span-2 flex justify-center"
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.8 }}
							whileInView={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.7, delay: 0.4 }}
							viewport={{ once: true }}
							className="relative"
						>
							<div className="w-80 h-80 lg:w-[450px] lg:h-[550px] rounded-full overflow-hidden bg-white shadow-2xl">
								<img
									src={PreventCollisionImg.src}
									alt="Child wearing blue helmet with skateboard"
									className="w-full h-full object-cover"
								/>
							</div>
						</motion.div>
					</motion.div>

					{/* Right Content */}
					<motion.div
						initial={{ opacity: 0, x: 50 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.3 }}
						viewport={{ once: true }}
						className="relative col-span-1"
					>
						<motion.div className="space-y-8">
							<Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105">
								Buy Now
							</Button>
							<p className="text-gray-600 leading-relaxed">
							Every helmet is ISI certified and built with high-impact technology that protects kids from bumps, falls, and collisions.
							</p>

							<motion.div
								initial={{ opacity: 0, scale: 0.8 }}
								whileInView={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.5, delay: 0.6 }}
								viewport={{ once: true }}
								className="flex justify-center items-center bg-white rounded-full py-16 px-6 w-fit ml-10 shadow-lg"
							>
								<img
									src={PinkHelmet.src}
									alt="Pink unicorn helmet"
									className="w-32 h-32 object-contain"
								/>
							</motion.div>
						</motion.div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
