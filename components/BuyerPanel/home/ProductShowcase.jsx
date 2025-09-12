"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import ProductCard from "@/components/BuyerPanel/products/ProductCard.jsx";
import { useDotButton } from "@/components/BuyerPanel/home/ProductShowcaseCarousel/carouselDotButtons.jsx";
import { usePrevNextButtons } from "@/components/BuyerPanel/home/ProductShowcaseCarousel/carouselArrowButtons.jsx";
import { DotButton } from "@/components/BuyerPanel/home/ProductShowcaseCarousel/carouselDotButtons.jsx";
import {
	PrevButton,
	NextButton,
} from "@/components/BuyerPanel/home/ProductShowcaseCarousel/carouselArrowButtons.jsx";
import { Product16 } from "@/public/images/home/index.js";
import ProductImg from "@/public/images/products/IS-P2.png";

export default function ProductShowcase({ products = [] }) {
	const [emblaRef, emblaApi] = useEmblaCarousel({
		slidesToScroll: 1,
		containScroll: "trimSnaps",
		breakpoints: {
			"(min-width: 768px)": { slidesToScroll: 2 },
		},
	});

	const { selectedIndex, scrollSnaps, onDotButtonClick } =
		useDotButton(emblaApi);

	const {
		prevBtnDisabled,
		nextBtnDisabled,
		onPrevButtonClick,
		onNextButtonClick,
	} = usePrevNextButtons(emblaApi);

	// Show loading state if no products
	if (!products || products.length === 0) {
		return (
			<section className="py-6 sm:py-8 lg:py-12 bg-white min-h-[calc(100vh-136px)]">
				<div className="h-full px-10 sm:px-6 lg:px-10">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 h-full">
						<div className="lg:col-span-1 flex flex-col justify-center">
							<div className="animate-pulse">
								<div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
								<div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
								<div className="h-4 bg-gray-200 rounded w-2/3"></div>
							</div>
						</div>
						<div className="lg:col-span-2">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{[1, 2, 3, 4].map((i) => (
									<div key={i} className="animate-pulse">
										<div className="bg-gray-200 rounded-lg h-64"></div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="py-6 sm:py-8 lg:py-12 bg-white min-h-[calc(100vh-136px)]">
			<div className="h-full px-10 sm:px-6 lg:px-10">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 h-full">
					{/* Left Column - Promotional Content */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="lg:col-span-1 flex flex-col justify-between"
					>
						{/* Header Content */}
						<div>
							<h3 className="text-gray-300 text-sm sm:text-base font-medium mb-4">
								<span className="text-yellow-500">CHECK OUR PRODUCTS</span>{" "}
								SAFETY FIRST
							</h3>

							<h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
								UP TO <span className="text-yellow-500">50%</span>{" "}
								<span className="text-black">OFF!</span>
							</h2>

							<p className="text-gray-600 mt-4 text-sm sm:text-base lg:text-lg max-w-md">
								This refers to protective equipment like helmets, gloves,
								goggles, boots, etc., used to prevent injury in hazardous
								environments.
							</p>
						</div>

						{/* Product Image */}
						<div className="mt-6 lg:mt-8 flex justify-center lg:justify-start">
							<div className="relative w-full max-w-xs sm:max-w-sm">
								<Image
									src={ProductImg.src}
									alt="Product 16"
									width={400}
									height={300}
									className="w-full h-auto max-h-[300px] rounded-lg object-contain"
									sizes="(max-width: 640px) 300px, (max-width: 1024px) 400px, 250px"
								/>
							</div>
						</div>

						{/* Carousel Controls */}
						<div className="mt-6 lg:mt-8 flex items-center justify-between">
							<div className="flex items-center gap-2">
								<PrevButton
									onClick={onPrevButtonClick}
									disabled={prevBtnDisabled}
								/>
								<NextButton
									onClick={onNextButtonClick}
									disabled={nextBtnDisabled}
								/>
							</div>
							<div className="flex items-center gap-2">
								{scrollSnaps.map((_, index) => (
									<DotButton
										key={index}
										onClick={() => onDotButtonClick(index)}
										className={`w-3 h-3 rounded-full transition-all duration-200 ${
											index === selectedIndex
												? "bg-black w-8"
												: "bg-gray-300 hover:bg-gray-400"
										}`}
									/>
								))}
							</div>
						</div>
					</motion.div>

					{/* Right Column - Product Cards Carousel */}
					<div className="lg:col-span-2">
						<div className="overflow-hidden" ref={emblaRef}>
							<div className="flex gap-4 sm:gap-6 lg:gap-8 md:px-10">
								{products.map((product, index) => (
									<div
										key={product.id}
										className="flex-shrink-0 w-full md:w-1/2 h-auto"
									>
										<motion.div
											initial={{ opacity: 0, y: 20 }}
											whileInView={{ opacity: 1, y: 0 }}
											viewport={{ once: true }}
											transition={{ delay: index * 0.1 }}
											className="max-w-[500px] h-full"
										>
											<ProductCard product={product} />
										</motion.div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
