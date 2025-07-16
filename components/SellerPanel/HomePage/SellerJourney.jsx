import { Icon1, Icon2, Icon3 } from "@/public/images/seller-panel/home/journey";

export default function SellerJourney() {
	const steps = [
		{
			step: 1,
			title: "Setup Your Profile",
			description: "Upload business details - GSTIN, PAN, bank info.",
			icon: Icon1,
		},
		{
			step: 2,
			title: "List Products by Category",
			description:
				"Drag, drop, or bulk-upload CSVs. Add price, MOQ, specs, media.",
			icon: Icon2,
		},
		{
			step: 3,
			title: "Track & Get Order",
			description:
				"Manage orders, inquiries, payouts - all from one clean dashboard.",
			icon: Icon3,
		},
	];

	return (
		<section className="py-10 bg-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
						Seller Journey: How It Works
					</h2>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{steps.map((step, index) => (
						<div key={index} className="text-center">
							<div className="border-x-4 border-y-8 border-black rounded-3xl p-8 h-full">
								<div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
									<img src={step.icon.src} alt="Icon" />
								</div>
								<div className="mb-4">
									<h3 className="text-xl font-bold text-gray-900 mt-2">
										Step {step.step}: {step.title}
									</h3>
								</div>
								<p className="text-gray-600">{step.description}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
