"use client";

import { useState } from "react";
import Image from "next/image";
import {
	VideoBanner,
	Logo1,
	Logo2,
	Logo3,
	Logo4,
	Logo5,
	Logo6,
} from "@/public/images/seller-panel/home/hero";
import "./HeroSection.css";

export default function HeroSection() {
	const [isVideoPlaying, setIsVideoPlaying] = useState(false);

	const logos = [Logo1, Logo2, Logo3, Logo4, Logo5, Logo6];

	return (
		<section className="relative py-10 bg-[#424242]">
			<div className="absolute inset-0 bg-black/40 -z-10" />
			<div className="w-full h-full bg-gradient absolute bottom-0 left-0 z-10" />
			<div className="px-10 relative z-20">
				{/* Trust Badge */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center bg-neutral-800 rounded-full px-4 py-2 text-sm">
						<span className="text-white">
							Trusted by many sellers across India 🇮🇳
						</span>
					</div>
				</div>

				{/* Main Hero Content */}
				<div className="text-center mb-12">
					<h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
						Sell Safety. Deliver Trust.
						<br />
						Expand Nationwide
					</h1>
					<p className="text-xl mb-8 max-w-3xl mx-auto">
						Join India's most reliable B2B & B2C marketplace for road safety,
						industrial protection, and emergency equipment. Showcase your
						products. Gain verified buyers. Grow faster.
					</p>

					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
						<button className="bg-amber-400 hover:bg-amber-500 text-black px-8 py-3 rounded-full font-medium text-lg transition-colors duration-200">
							Register
						</button>
						<button className="bg-black hover:opacity-80 text-white border border-white/80 px-8 py-3 rounded-full font-medium text-lg transition-colors duration-200">
							Explore Buyer Marketplace
						</button>
						<button className="hover:bg-neutral-800 hover:opacity-80 border border-white/80 px-8 py-3 rounded-full font-medium text-lg transition-colors duration-200">
							Schedule Demo Call
						</button>
					</div>
				</div>

				{/* Video/Image Section */}
				<div className="relative max-w-4xl mx-auto mb-12">
					<div className="relative rounded-3xl overflow-hidden">
						<Image
							src={VideoBanner.src}
							alt="Construction workers with safety equipment"
							width={800}
							height={500}
							className="w-full h-auto"
							priority
						/>
						{!isVideoPlaying && (
							<button
								onClick={() => setIsVideoPlaying(true)}
								className="absolute inset-0 flex items-center justify-center bg-transparent bg-opacity-30 hover:bg-opacity-40 transition-all duration-200"
							>
								<div className="w-20 h-20 bg-amber-400 drop-shadow-2xl rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200">
									<svg
										className="w-8 h-8 text-white ml-1"
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<path d="M8 5v14l11-7z" />
									</svg>
								</div>
							</button>
						)}
					</div>
				</div>

				{/* Partner Logos */}
				<div className="text-center bg-white rounded-3xl py-4">
					<div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
						{logos.map((logo, index) => (
							<Image
								key={index}
								src={logo.src}
								alt="Logo"
								height={200}
								width={200}
								className="w-32 h-auto object-contain"
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
