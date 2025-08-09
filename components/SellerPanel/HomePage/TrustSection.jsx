"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import avatar1 from "@/public/images/avatar/avatar1.png";
import avatar2 from "@/public/images/avatar/avatar2.png";

export default function TrustSection() {
	const [expandedFaq, setExpandedFaq] = useState(null);

	const successStories = [
		{
			name: "Siddharth Arora",
			company: "SafetyGear India",
			story:
				"In 2 months, we scaled from 3 to 13 states. SafeTrade gave us access to serious institutional buyers.",
			avatar: avatar1,
		},
		{
			name: "Ritika Mehra",
			company: "FireLine Equipments",
			story:
				"Uploading 50+ SKUs took just 15 minutes. Their dashboard is a game-changer.",
			avatar: avatar2,
		},
	];

	const faqs = [
		{
			question: "What documents are needed to start selling?",
			answer:
				"To start selling on SafeTrade, you'll need basic business documents including GST registration, PAN card, bank account details, and relevant product certifications or licenses depending on your category.",
		},
		{
			question: "How do I manage shipping?",
			answer:
				"SafeTrade provides integrated logistics solutions with multiple shipping partners. You can choose from our recommended courier services or use your own logistics provider. We handle tracking and delivery notifications automatically.",
		},
		{
			question: "When will I receive payment?",
			answer:
				"Payments are processed within 7-10 business days after successful delivery and buyer confirmation. All transactions go through our secure payment gateway with automatic settlement to your registered bank account.",
		},
		{
			question: "What if a buyer raises a dispute?",
			answer:
				"Our dedicated support team mediates all disputes fairly. We have a structured resolution process that typically resolves issues within 3-5 business days. Both parties can present their case through our platform.",
		},
		{
			question: "Can I get MOQs and Bulk Discounts?",
			answer:
				"Yes, you can set minimum order quantities (MOQs) for your products and offer tiered pricing for bulk orders. Our platform supports dynamic pricing based on order volume to help you maximize sales.",
		},
	];

	const toggleFaq = (index) => {
		setExpandedFaq(expandedFaq === index ? null : index);
	};

	return (
		<section className="py-10">
			<div className="px-10">
				{/* Success Stories */}
				<div className="mb-20 bg-neutral-200 rounded-3xl p-10">
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
						Seller Success Stories
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{successStories.map((story, index) => (
							<div
								key={index}
								className="flex items-start space-x-4 bg-white rounded-2xl p-8"
							>
								<div className="w-28 h-28 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
									<img src={story.avatar.src} alt="Avatar" />
								</div>
								<div>
									<p className="text-gray-700 mb-4">{story.story}</p>
									<div>
										<div className="font-semibold text-gray-900">
											— {story.name}, {story.company}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* FAQs */}
				<div>
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
						Seller FAQs
					</h2>
					<div className="max-w-3xl mx-auto space-y-4">
						{faqs.map((faq, index) => (
							<motion.div
								key={index}
								className="border border-gray-200 rounded-lg overflow-hidden"
								initial={false}
								animate={{
									boxShadow:
										expandedFaq === index
											? "0 4px 12px rgba(0, 0, 0, 0.1)"
											: "0 1px 3px rgba(0, 0, 0, 0.05)",
								}}
								transition={{ duration: 0.3 }}
							>
								<motion.button
									className="w-full px-6 py-4 text-left flex items-center justify-between"
									onClick={() => toggleFaq(index)}
									whileTap={{ scale: 0.995 }}
								>
									<span className="font-medium text-gray-900">
										{faq.question}
									</span>
									<motion.svg
										className="w-5 h-5 text-gray-500"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										animate={{ rotate: expandedFaq === index ? 180 : 0 }}
										transition={{ duration: 0.3, ease: "easeInOut" }}
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 9l-7 7-7-7"
										/>
									</motion.svg>
								</motion.button>
								<AnimatePresence>
									{expandedFaq === index && (
										<motion.div
											initial={{ height: 0, opacity: 0 }}
											animate={{
												height: "auto",
												opacity: 1,
												transition: {
													height: { duration: 0.4, ease: "easeInOut" },
													opacity: { duration: 0.3, delay: 0.1 },
												},
											}}
											exit={{
												height: 0,
												opacity: 0,
												transition: {
													height: { duration: 0.3, ease: "easeInOut" },
													opacity: { duration: 0.2 },
												},
											}}
											className="overflow-hidden"
										>
											<motion.div
												className="px-6 pb-4 text-gray-600"
												initial={{ y: -10 }}
												animate={{ y: 0 }}
												exit={{ y: -10 }}
												transition={{ duration: 0.3 }}
											>
												<p>{faq.answer}</p>
											</motion.div>
										</motion.div>
									)}
								</AnimatePresence>
							</motion.div>
						))}
					</div>
				</div>

				{/* Support Section */}
				<div className="rounded-2xl p-12 text-center">
					<div className="mb-8 p-4 border border-gray-300 rounded-xl">
						<div className="flex justify-center mb-4">
							<div className="flex -space-x-2">
								<Avatar>
									<AvatarImage
										src="https://github.com/shadcn.png"
										alt="@shadcn"
									/>
									<AvatarFallback>CN</AvatarFallback>
								</Avatar>
								<Avatar>
									<AvatarImage
										src="https://github.com/shadcn.png"
										alt="@shadcn"
									/>
									<AvatarFallback>CN</AvatarFallback>
								</Avatar>
								<Avatar>
									<AvatarImage
										src="https://github.com/shadcn.png"
										alt="@shadcn"
									/>
									<AvatarFallback>CN</AvatarFallback>
								</Avatar>
							</div>
						</div>
						<h3 className="text-xl font-bold text-gray-900 mb-2">
							Still have questions?
						</h3>
						<p className="text-gray-600 mb-6">
							Can't find the answer you're looking for? Please chat to our
							friendly team.
						</p>
						<button className="bg-amber-400 hover:bg-amber-500 text-black px-6 py-3 rounded-full font-medium">
							Get in touch
						</button>
					</div>

					<div className="space-y-3">
						<h3 className="text-2xl font-bold text-gray-900">
							Need Help? We've Got You
						</h3>
						<p className="text-lg text-gray-900">Talk to a platform expert</p>
						<p className="text-gray-900 font-medium">support@safetrade.in</p>
						<p className="text-gray-900 font-medium">
							WhatsApp: +91-XXXXXXXXXX
						</p>

						<button className="bg-amber-400 hover:bg-amber-500 text-black px-6 py-3 rounded-full font-medium">
							Book a Demo Call
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}
