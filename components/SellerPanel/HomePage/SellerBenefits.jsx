import {
	Picture1,
	Picture2,
	Picture3,
	Picture4,
	Picture5,
	UserVoice,
} from "@/public/images/seller-panel/home/trust";

export default function SellerBenefits() {
	const benefits = [
		{ feature: "Free Onboarding", value: "Get personalized setup help" },
		{ feature: "Early-Bird Perks", value: "₹1,000 in Ad Credits" },
		{ feature: "Verified Badge", value: "Increases buyer trust" },
		{ feature: "RFQ Priority Access", value: "Close more deals faster" },
		{ feature: "Instant Payouts", value: "Speed up your cashflow" },
		{
			feature: "Catalog PDF Generator",
			value: "Share digital brochures instantly",
		},
	];

	const checkoutFeatures = [
		"Multi-gateway: Razorpay, Paytm, UPI, Cards, COD",
		"GST-Compliant Invoices",
		"Real Order Flow for B2B",
		"Buyer Verification for High-Value Orders",
		"Live Order Status + Tracking",
	];

	const trustFeatures = [
		{
			title: "Verified B2B & B2C Buyer Access",
			description:
				"Get orders from businesses, vendors, contractors & institutions",
			icon: "🏢",
			img: Picture1,
		},
		{
			title: "0% Commission for First 3 Months",
			description: "Test the platform risk-free",
			icon: "💰",
			img: Picture2,
		},
		{
			title: "Seller Performance Tools",
			description: "Detailed analytics to grow smarter",
			icon: "📊",
			img: Picture3,
		},
		{
			title: "Inbuilt Promotions Engine",
			description: "Launch offers, bundle deals, and festive discounts",
			icon: "🎯",
			img: Picture4,
		},
		{
			title: "Top-Rated Seller Support",
			description: "24/7 onboarding, listing, and dispute resolution help",
			icon: "⭐",
			img: Picture5,
		},
	];

	return (
		<section className="py-10 bg-white">
			<div className="px-10">
				{/* Secure Checkout */}
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
						Secure Checkout + Payments
					</h2>
					<div className="flex flex-wrap justify-center gap-4 mb-12">
						{checkoutFeatures.map((feature, index) => (
							<div
								key={index}
								className="max-w-[300px] flex flex-col gap-2 bg-white rounded-2xl p-4 shadow-lg border-gray-200 border"
							>
								<img src={UserVoice.src} alt="Check" className="w-12 h-12" />
								{feature}
							</div>
						))}
					</div>
				</div>

				{/* Why Sellers Trust SafeTrade */}
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
						Why Sellers Trust SafeTrade
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
						{trustFeatures.slice(0, 2).map((feature, index) => (
							<div
								key={index}
								className="flex flex-col justify-center items-center gap-4 rounded-2xl p-8 shadow-lg text-center border border-gray-200"
							>
								<img src={feature.img.src} alt="Banner" className="w-48 h-48 object-contain" />
								<h3 className="text-2xl font-bold text-gray-900">
									{feature.title}
								</h3>
								<p className="text-gray-600">{feature.description}</p>
							</div>
						))}
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{trustFeatures.slice(2, 5).map((feature, index) => (
							<div
								key={index}
								className="flex flex-col justify-center items-center gap-4 rounded-2xl p-8 shadow-lg text-center border border-gray-200"
							>
								<img src={feature.img.src} alt="Banner" className="w-48 h-48 object-contain" />
								<h3 className="text-2xl font-bold text-gray-900">
									{feature.title}
								</h3>
								<p className="text-gray-600">{feature.description}</p>
							</div>
						))}
					</div>
				</div>

				{/* Quick Glance Benefits */}
				<div className="max-w-2xl mx-auto">
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-6">
						Quick Glance: Seller Benefits
					</h2>
					<div className="rounded-2xl p-8 border border-gray-300">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="font-semibold text-amber-400 text-3xl">
								Feature
							</div>
							<div className="font-semibold text-amber-400 text-3xl">Value</div>
							{benefits.map((benefit, index) => (
								<>
									<div
										key={`feature-${index}`}
										className="text-xl py-3 font-bold"
									>
										{benefit.feature}
									</div>
									<div key={`value-${index}`} className="text-xl py-3">
										{benefit.value}
									</div>
								</>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
