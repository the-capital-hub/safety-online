import Image from "next/image";
import Picture1 from "@/public/images/seller-panel/home/product-details/Picture1.png";
import ProductDetailDemo from "@/components/SellerPanel/HomePage/ProductDetailDemo.jsx";

export default function ProductDetailSection() {
	return (
		<section className="py-10 bg-white">
			<div className="px-10">
				<div className="text-center mb-8">
					<div className="mb-8">
						<Image
							src={Picture1.src}
							alt="Buyer Seller Interaction"
							width={350}
							height={300}
							className="mx-auto"
						/>
					</div>
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
						Product Detail Pages (Buyer-Facing)
					</h2>
				</div>

				<ProductDetailDemo />
			</div>
		</section>
	);
}
