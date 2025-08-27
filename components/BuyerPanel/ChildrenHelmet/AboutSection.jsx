"use client";
import { motion } from "framer-motion";
import { GrayHelmet } from "@/public/images/children-helmet/index.js";

export default function AboutSection() {
	return (
		<section id="about" className="py-10 overflow-hidden">
			<div className="px-10">
				<div className="grid lg:grid-cols-2 gap-12 items-center">
					{/* Left Content - Image */}
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8 }}
					>
						<img
							src={GrayHelmet.src}
							alt="Professional helmet design"
							className="w-auto h-[350px] mx-auto rounded-2xl"
						/>
					</motion.div>

					{/* Right Content */}
					<motion.div
						initial={{ opacity: 0, x: 50 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="space-y-6"
					>
						<div className="space-y-4">
							<h2 className="text-4xl lg:text-6xl font-bold leading-tight">
								About Safety Online
							</h2>

							<h3 className="text-xl font-semibold text-primary">
								We Are Focusing On Your Children's Safety First
							</h3>
						</div>

						<div className="space-y-4">
							<p>
								Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
								eiusmod tempor incididunt ut labore et dolore magna aliqua.
								Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
								eiusmod tempor incididunt ut labore et dolore magna aliqua.
							</p>

							<p>
								Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
								eiusmod tempor incididunt ut labore et dolore magna aliqua.
							</p>

							<p>
								Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
								eiusmod tempor incididunt ut labore
							</p>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
