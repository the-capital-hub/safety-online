// "use client";

// import Image from "next/image";
// import { motion } from "framer-motion";
// import ProductCarousel from "@/components/home/ProductCarousel.jsx";
// import ProductCard from "@/components/home/ProductCard1.jsx";
// import {
// 	Product1,
// 	Product2,
// 	Product4,
// 	Product3,
// 	Product16,
// } from "@/public/images/home/index.js";

// export default function ProductShowcase() {
// 	const products = [
// 		{
// 			id: 1,
// 			title: "SAFETY AND EFFICIENCY",
// 			subtitle: "HAND-IN-HAND",
// 			price: "₹ 5,000",
// 			image: Product3.src,
// 			colors: ["blue", "black", "red", "orange"],
// 		},
// 		{
// 			id: 2,
// 			title: "STOP SIGNALS",
// 			subtitle: "HAND-IN-HAND",
// 			price: "₹ 5,000",
// 			image: Product4.src,
// 			colors: ["blue", "black", "red", "orange"],
// 		},
// 		{
// 			id: 3,
// 			title: "INDUSTRIAL SAFETY",
// 			subtitle: "PROTECTION FIRST",
// 			price: "₹ 5,000",
// 			image: Product1.src,
// 			colors: ["blue", "black", "red", "orange"],
// 		},
// 	];

// 	return (
// 		<section className="py-8 md:py-12 bg-white h-[calc(100vh-136px)]">
// 			<div className="h-full px-10 grid grid-cols-1 md:grid-cols-3 gap-8">
// 				<motion.div
// 					initial={{ opacity: 0, y: 20 }}
// 					whileInView={{ opacity: 1, y: 0 }}
// 					viewport={{ once: true }}
// 				>
// 					<h3 className="text-gray-300 text-md font-medium mb-4">
// 						<span className="text-yellow-500">CHECK OUR PRODUCTS</span> SAFETY
// 						FIRST
// 					</h3>

// 					<h2 className="text-2xl md:text-6xl font-bold">
// 						UP TO <span className="text-yellow-500">50%</span>{" "}
// 						<span className="text-black">OFF!</span>
// 					</h2>
// 					<p className="text-gray-600 mt-4 max-w-md text-sm md:text-base">
// 						This refers to protective equipment like helmets, gloves, goggles,
// 						boots, etc., used to prevent injury in hazardous environments.
// 					</p>
// 					<Image
// 						src={Product16.src}
// 						alt="Product 16"
// 						width={400}
// 						height={400}
// 						className="w-full h-auto rounded max-h-[150px] object-contain mt-8"
// 					/>
// 				</motion.div>

// 				<div className="col-span-2 flex flex-col md:flex-row gap-8">
// 					{/* <ProductCarousel products={products} /> */}
// 					<ProductCard product={products[0]} />
// 					<ProductCard product={products[1]} />
// 				</div>
// 			</div>
// 		</section>
// 	);
// }

"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import ProductCarousel from "@/components/home/ProductCarousel.jsx";
import ProductCard from "@/components/home/ProductCard1.jsx";
import {
	Product1,
	Product2,
	Product4,
	Product3,
	Product16,
} from "@/public/images/home/index.js";

export default function ProductShowcase() {
	const products = [
		{
			id: 1,
			title: "SAFETY AND EFFICIENCY",
			subtitle: "HAND-IN-HAND",
			price: "₹ 5,000",
			image: Product3.src,
			colors: ["blue", "black", "red", "orange"],
		},
		{
			id: 2,
			title: "STOP SIGNALS",
			subtitle: "HAND-IN-HAND",
			price: "₹ 5,000",
			image: Product4.src,
			colors: ["blue", "black", "red", "orange"],
		},
		{
			id: 3,
			title: "INDUSTRIAL SAFETY",
			subtitle: "PROTECTION FIRST",
			price: "₹ 5,000",
			image: Product1.src,
			colors: ["blue", "black", "red", "orange"],
		},
	];

	return (
		<section className="py-6 sm:py-8 lg:py-12 bg-white min-h-[calc(100vh-136px)]">
			<div className="h-full px-10 sm:px-6 lg:px-10">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 h-full">
					{/* Left Column - Promotional Content */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="lg:col-span-4 flex flex-col justify-between"
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
									src={Product16.src}
									alt="Product 16"
									width={400}
									height={200}
									className="w-full h-auto rounded-lg object-contain"
									sizes="(max-width: 640px) 300px, (max-width: 1024px) 400px, 350px"
								/>
							</div>
						</div>
					</motion.div>

					{/* Right Column - Product Cards */}
					<div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
						{/* First Product Card */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: 0.1 }}
							className="h-80 sm:h-96 md:h-[450px] lg:h-[500px]"
						>
							<ProductCard product={products[0]} />
						</motion.div>

						{/* Second Product Card */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: 0.2 }}
							className="h-80 sm:h-96 md:h-[450px] lg:h-[500px]"
						>
							<ProductCard product={products[1]} />
						</motion.div>
					</div>
				</div>
			</div>
		</section>
	);
}
