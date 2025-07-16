import Image from "next/image";
import Picture1 from "@/public/images/seller-panel/home/product-details/Picture1.png";
import Picture2 from "@/public/images/seller-panel/home/product-details/Picture2.png";
import Picture3 from "@/public/images/seller-panel/home/product-details/Picture3.png";
import Picture4 from "@/public/images/seller-panel/home/product-details/Picture4.png";
import Picture5 from "@/public/images/seller-panel/home/product-details/Picture5.png";

export default function ProductDetailSection() {
	const productImages = [Picture3, Picture4, Picture5];

	return (
		<section className="py-10 bg-white">
			<div className="px-10">
				<div className="text-center mb-16">
					<div className="mb-8">
						<Image
							src={Picture1.src}
							alt="Buyer Seller Interaction"
							width={400}
							height={300}
							className="mx-auto"
						/>
					</div>
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
						Product Detail Pages (Buyer-Facing)
					</h2>
				</div>

				{/* Three Big Images */}
				{/* <div className="flex flex-col  gap-8 mb-16">
					{productImages.map((image, index) => (
						<div
							key={index}
							className="bg-white rounded-2xl shadow-lg overflow-hidden"
						>
							<Image
								src={image.src}
								alt={`Product Detail View ${index + 1}`}
								width={400}
								height={500}
								className="w-full h-auto object-contain"
							/>
						</div>
					))}
				</div> */}

				<Image
					src={Picture2.src}
					alt="Buyer Seller Interaction"
					width={400}
					height={300}
					className="w-full h-auto object-contain"
				/>
			</div>
		</section>
	);
}
