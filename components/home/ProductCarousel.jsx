"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
// import ProductCard from "@/components/home/ProductCard.jsx";
import ProductCard from "@/components/products/ProductCard.jsx";

export default function ProductCarousel({
	products,
	showDots = true,
	autoplay = true,
}) {
	const [emblaRef, emblaApi] = useEmblaCarousel(
		{ loop: true, align: "start" },
		autoplay ? [Autoplay({ delay: 3000 })] : []
	);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [scrollSnaps, setScrollSnaps] = useState([]);

	const scrollPrev = useCallback(() => {
		if (emblaApi) emblaApi.scrollPrev();
	}, [emblaApi]);

	const scrollNext = useCallback(() => {
		if (emblaApi) emblaApi.scrollNext();
	}, [emblaApi]);

	const scrollTo = useCallback(
		(index) => {
			if (emblaApi) emblaApi.scrollTo(index);
		},
		[emblaApi]
	);

	const onSelect = useCallback(() => {
		if (!emblaApi) return;
		setSelectedIndex(emblaApi.selectedScrollSnap());
	}, [emblaApi]);

	useEffect(() => {
		if (!emblaApi) return;
		onSelect();
		setScrollSnaps(emblaApi.scrollSnapList());
		emblaApi.on("select", onSelect);
	}, [emblaApi, onSelect]);

	return (
		<div className="relative">
			{/* Navigation Arrows */}
			<div className="flex justify-end space-x-2 mb-4">
				<Button variant="outline" size="icon" onClick={scrollPrev}>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<Button variant="outline" size="icon" onClick={scrollNext}>
					<ArrowRight className="h-4 w-4" />
				</Button>
			</div>

			{/* Carousel */}
			<div className="embla overflow-hidden" ref={emblaRef}>
				<div className="embla__container flex">
					{products.map((product, index) => (
						<motion.div
							key={product.id}
							initial={{ opacity: 0, x: 50 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ delay: index * 0.1 }}
							className="embla__slide flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-4"
						>
							<ProductCard product={product} />
						</motion.div>
					))}
				</div>
			</div>

			{/* Dot Indicators */}
			{showDots && (
				<div className="flex justify-center space-x-2 mt-6">
					{scrollSnaps.map((_, index) => (
						<button
							key={index}
							className={`w-3 h-3 rounded-full transition-colors ${
								index === selectedIndex ? "bg-black" : "bg-gray-300"
							}`}
							onClick={() => scrollTo(index)}
						/>
					))}
				</div>
			)}
		</div>
	);
}
