import Image from "next/image";
import {
	Icon1,
	Icon2,
	Icon3,
	Picture1,
	Picture2,
	Picture3,
} from "@/public/images/seller-panel/home/features";

export default function SellerFeatures() {
	const features = [
		{
			icon: Icon1,
			title: "Smart Catalog Manager",
			description: "Bulk upload SKUs with advanced inventory tools",
			img: Picture1,
		},
		{
			icon: Icon2,
			title: "Insights Dashboard",
			description:
				"View real-time sales, traffic, buyer behavior & conversion rates",
			img: Picture2,
		},
		{
			icon: Icon3,
			title: "100% Compliance Ready",
			description: "GST invoicing, PAN-linked payouts, and secure tax record",
			img: Picture3,
		},
		{
			icon: Icon1,
			title: "Marketing Boosters",
			description: "Apply for Featured Listings & Homepage Spotlight",
		},
		{
			icon: Icon1,
			title: "Secure Payment Gateway",
			description: "Razorpay, Paytm, UPI, NEFT - all transactions traceable",
		},
		{
			icon: Icon1,
			title: "Flexible Fulfillment",
			description:
				"Ship yourself via 3PL or choose Fulfillment by SafeTrade (FBS)",
		},
	];

	return (
		<section className="py-10 bg-gray-200">
			<div className="px-10">
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
						Seller Features That
					</h2>
					<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
						Power Your Business
					</h2>
					<p className="text-xl text-gray-600">
						A modular grid with vibrant icons and sharp copy
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
					{features.slice(0, 2).map((feature, index) => (
						<div
							key={index}
							className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
						>
							<div className="w-16 h-16 bg-orange-100 p-2 rounded-full flex items-center justify-center mb-4">
								<img src={feature.icon.src} alt="Banner" className="" />
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-2">
								{feature.title}
							</h3>
							<p className="text-gray-600 mb-4">{feature.description}</p>

							{feature.img && (
								<img src={feature.img.src} className="w-auto mx-auto h-[300px]" />
							)}
						</div>
					))}
				</div>

				<div className="flex flex-col lg:flex-row justify-between bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 mb-10">
					<div>
						<div className="w-20 h-20 bg-orange-100 p-2 rounded-full flex items-center justify-center mb-6">
							<img src={features[2].icon.src} alt="" />
						</div>
						<h3 className="text-xl font-bold text-gray-900 mb-4">
							{features[2].title}
						</h3>
						<p className="text-gray-600">{features[2].description}</p>
					</div>
					{features[2].img && <img src={features[2].img.src} />}
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
					{features.slice(3, 6).map((feature, index) => (
						<div
							key={index}
							className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
						>
							<div className="w-16 h-16 bg-orange-100 p-2 rounded-full flex items-center justify-center mb-6">
								<img src={feature.icon.src} alt="" />
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-4">
								{feature.title}
							</h3>
							<p className="text-gray-600">{feature.description}</p>
							{feature.img && <img src={feature.img.src} />}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
