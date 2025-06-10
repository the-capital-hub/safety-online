"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	Search,
	MessageCircle,
	Phone,
	Mail,
	FileText,
	ExternalLink,
} from "lucide-react";

const cardVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: (i) => ({
		opacity: 1,
		y: 0,
		transition: {
			delay: i * 0.1,
			duration: 0.5,
		},
	}),
};

const faqs = [
	{
		question: "How do I track my order?",
		answer:
			"You can track your order by going to the Order History section and clicking on the order you want to track. You'll see real-time updates on your order status.",
	},
	{
		question: "What is your return policy?",
		answer:
			"We offer a 30-day return policy for most items. Items must be in original condition with tags attached. Some restrictions apply for certain product categories.",
	},
	{
		question: "How do I change my shipping address?",
		answer:
			"You can update your shipping address in the My Profile section under Addresses. Make sure to save your changes before placing your next order.",
	},
	{
		question: "How do I cancel my order?",
		answer:
			"Orders can be cancelled within 1 hour of placement if they haven't been processed yet. Go to Order History and click the cancel button next to your order.",
	},
	{
		question: "What payment methods do you accept?",
		answer:
			"We accept all major credit cards, PayPal, Apple Pay, Google Pay, and various UPI methods. You can manage your payment methods in the Payment Options section.",
	},
];

const contactMethods = [
	{
		icon: MessageCircle,
		title: "Live Chat",
		description: "Chat with our support team",
		action: "Start Chat",
		available: "24/7",
	},
	{
		icon: Phone,
		title: "Phone Support",
		description: "Call us for immediate assistance",
		action: "Call Now",
		available: "Mon-Fri 9AM-6PM",
	},
	{
		icon: Mail,
		title: "Email Support",
		description: "Send us a detailed message",
		action: "Send Email",
		available: "Response within 24hrs",
	},
];

export function HelpCenter() {
	return (
		<div className="space-y-6">
			{/* Search Help */}
			<motion.div
				custom={0}
				initial="hidden"
				animate="visible"
				variants={cardVariants}
			>
				<Card>
					<CardHeader>
						<CardTitle>How can we help you?</CardTitle>
						<CardDescription>
							Search our help center or browse frequently asked questions
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search for help articles, FAQs, or topics..."
								className="pl-10"
							/>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Contact Methods */}
			<motion.div
				custom={1}
				initial="hidden"
				animate="visible"
				variants={cardVariants}
			>
				<Card>
					<CardHeader>
						<CardTitle>Contact Support</CardTitle>
						<CardDescription>
							Get in touch with our support team
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{contactMethods.map((method) => (
								<div
									key={method.title}
									className="border rounded-lg p-4 text-center"
								>
									<method.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
									<h3 className="font-medium mb-1">{method.title}</h3>
									<p className="text-sm text-muted-foreground mb-2">
										{method.description}
									</p>
									<p className="text-xs text-muted-foreground mb-3">
										{method.available}
									</p>
									<Button variant="outline" size="sm" className="w-full">
										{method.action}
									</Button>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* FAQ Section */}
			<motion.div
				custom={2}
				initial="hidden"
				animate="visible"
				variants={cardVariants}
			>
				<Card>
					<CardHeader>
						<CardTitle>Frequently Asked Questions</CardTitle>
						<CardDescription>Find answers to common questions</CardDescription>
					</CardHeader>
					<CardContent>
						<Accordion type="single" collapsible className="w-full">
							{faqs.map((faq, index) => (
								<AccordionItem key={index} value={`item-${index}`}>
									<AccordionTrigger>{faq.question}</AccordionTrigger>
									<AccordionContent>{faq.answer}</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					</CardContent>
				</Card>
			</motion.div>

			{/* Contact Form */}
			<motion.div
				custom={3}
				initial="hidden"
				animate="visible"
				variants={cardVariants}
			>
				<Card>
					<CardHeader>
						<CardTitle>Send us a Message</CardTitle>
						<CardDescription>
							Can't find what you're looking for? Send us a detailed message
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="subject">Subject</Label>
								<Input id="subject" placeholder="What's this about?" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="category">Category</Label>
								<Input id="category" placeholder="Order, Payment, Account..." />
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="message">Message</Label>
							<Textarea
								id="message"
								placeholder="Describe your issue or question in detail..."
								className="min-h-[120px]"
							/>
						</div>
						<Button className="w-full">Send Message</Button>
					</CardContent>
				</Card>
			</motion.div>

			{/* Quick Links */}
			<motion.div
				custom={4}
				initial="hidden"
				animate="visible"
				variants={cardVariants}
			>
				<Card>
					<CardHeader>
						<CardTitle>Quick Links</CardTitle>
						<CardDescription>
							Helpful resources and documentation
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-4">
							<Button variant="outline" className="justify-start">
								<FileText className="h-4 w-4 mr-2" />
								Terms of Service
								<ExternalLink className="h-4 w-4 ml-auto" />
							</Button>
							<Button variant="outline" className="justify-start">
								<FileText className="h-4 w-4 mr-2" />
								Privacy Policy
								<ExternalLink className="h-4 w-4 ml-auto" />
							</Button>
							<Button variant="outline" className="justify-start">
								<FileText className="h-4 w-4 mr-2" />
								Shipping Info
								<ExternalLink className="h-4 w-4 ml-auto" />
							</Button>
							<Button variant="outline" className="justify-start">
								<FileText className="h-4 w-4 mr-2" />
								Return Policy
								<ExternalLink className="h-4 w-4 ml-auto" />
							</Button>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
