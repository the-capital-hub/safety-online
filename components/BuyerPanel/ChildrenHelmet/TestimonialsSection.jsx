"use client";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Star, Quote } from "lucide-react";
import {
	Avatar1,
	Avatar2,
	Avatar3,
	Comma,
	FiveStar,
} from "@/public/images/children-helmet/index.js";

export default function TestimonialsSection() {
	const testimonials = [
		{
			name: "Mike Torello",
			role: "CEO of Initech",
			image: Avatar1.src,
			rating: 5,
			text: "I like getting the SMS & knowing the jobs done. I often refer to it, 'hope you get a ping today!' because my product",
		},
		{
			name: "Richards Hawkins",
			role: "Marketing Manager of Upnow",
			image: Avatar2.src,
			rating: 5,
			text: "We have successfully sold digital product and have happy with the results & look forward to using it again this.",
		},
		{
			name: "Thomas Magnum",
			role: "Barellon NSW",
			image: Avatar3.src,
			rating: 5,
			text: "Design Monks offers producers a cost-effective selling tool. Having the ability to post prices that you want on an exchange visible.",
		},
	];

	return (
		<section id="testimonials" className="py-10 bg-gray-100 overflow-hidden">
			<div className="px-10">
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="text-center mb-16"
				>
					<h2 className="text-4xl lg:text-6xl font-bold mb-4">
						Get To Know Our Customers
					</h2>
				</motion.div>

				<div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
					{testimonials.map((testimonial, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: index * 0.2 }}
						>
							<Card className="bg-card hover:shadow-lg transition-shadow duration-300 h-full">
								<CardContent className="p-6">
									<div className="flex flex-col items-start gap-4 mb-4">
										<Quote className="w-12 h-12 text-amber-700 flex-shrink-0 mt-1" />
										<div className="flex-1">
											<p className="text-lg text-black mb-2">
												{testimonial.text}
											</p>
										</div>
									</div>

									<div className="flex items-center gap-3">
										<img
											src={testimonial.image || "/placeholder.svg"}
											alt={testimonial.name}
											className="w-12 h-12 rounded-full object-cover"
										/>
										<div>
											<div className="flex items-center gap-1">
												{[...Array(testimonial.rating)].map((_, i) => (
													<Star
														key={i}
														className="w-4 h-4 fill-yellow-400 text-yellow-400"
													/>
												))}
											</div>
											<div className="font-semibold text-primary">
												{testimonial.name}
											</div>
											<div className="text-sm">{testimonial.role}</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
