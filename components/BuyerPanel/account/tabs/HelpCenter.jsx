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
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
4;
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
	// Search,
	// MessageCircle,
	Phone,
	Mail,
	FileText,
	ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

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

export function HelpCenter() {
	const router = useRouter();

	const [subject, setSubject] = useState("");
	const [category, setCategory] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);

	const [messages, setMessages] = useState([]);
	const [selectedMessage, setSelectedMessage] = useState(null);
	const [openDialog, setOpenDialog] = useState(false);

	const fetchMessages = async () => {
		try {
			const res = await fetch("/api/support", { method: "GET" });
			const data = await res.json();
			if (data.success) {
				setMessages(data.messages);
			}
		} catch (error) {
			console.error("Error fetching messages:", error);
		}
	};

	useEffect(() => {
		fetchMessages();
	}, []);

	const handleSubmit = async () => {
		if (!subject || !category || !message) {
			toast.error("Please fill in all fields");
			return;
		}
		const wordCount = message.trim().split(/\s+/).length;
		if (wordCount < 10) {
			toast.error("Message must be at least 10 words long");
			return;
		}

		setLoading(true);
		try {
			const res = await fetch("/api/support", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ subject, category, message }),
			});

			const data = await res.json();

			if (data.success) {
				toast.success(data.message || "Message sent successfully");
				setSubject("");
				setCategory("");
				setMessage("");
				fetchMessages(); // refresh messages
			} else {
				toast.error(data.message || "Failed to send message. Try again.");
			}
		} catch (error) {
			toast.error("Something went wrong. Please try again later.");
		} finally {
			setLoading(false);
		}
	};

	const handleSendEmail = () => {
		toast.success("Opening email client...");
		const subject = encodeURIComponent("Need Help");
		const body = encodeURIComponent(
			"Hello,\n\nThis is the message body.\n\nThanks"
		);

		// Construct mailto link
		const mailtoLink = `mailto:help@safetyonline.in?subject=${subject}&body=${body}`;

		// Open default mail client
		window.location.href = mailtoLink;
	};

	const handleCallNow = () => {
		toast.success("Call functionality coming soon");
	};

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
						<CardTitle>Help Center</CardTitle>
						<CardDescription>How can we help you?</CardDescription>
					</CardHeader>
					{/* <CardContent>
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                                name="searchQuery"
                                                                placeholder="Search for help articles, FAQs, or topics..."
								className="pl-10"
							/>
						</div>
					</CardContent> */}
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
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Phone Support */}
							<div className="border rounded-lg p-4 text-center shadow-sm">
								<Phone className="h-8 w-8 mx-auto mb-3 text-primary" />
								<h3 className="font-medium mb-1">Phone Support</h3>
								<p className="text-sm text-muted-foreground mb-2">
									Call us on +919945234161 for immediate assistance
								</p>
								<p className="text-xs text-muted-foreground mb-3">
									Mon-Fri 9AM-6PM
								</p>
								<Button
									variant="outline"
									size="sm"
									className="w-full"
									onClick={handleCallNow}
								>
									Call Now
								</Button>
							</div>

							{/* Email Support */}
							<div className="border rounded-lg p-4 text-center shadow-sm">
								<Mail className="h-8 w-8 mx-auto mb-3 text-primary" />
								<h3 className="font-medium mb-1">Email Support</h3>
								<p className="text-sm text-muted-foreground mb-2">
									Send us a detailed message on hello@safetyonline.in
								</p>
								<p className="text-xs text-muted-foreground mb-3">
									Response within 24hrs
								</p>
								<Button
									variant="outline"
									size="sm"
									className="w-full"
									onClick={handleSendEmail}
								>
									Send Email
								</Button>
							</div>
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
			{/* <motion.div
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
								<Input
									id="subject"
									placeholder="What's this about?"
									value={subject}
									onChange={(e) => setSubject(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="category">Category</Label>
								<DropdownMenu className="w-full">
									<DropdownMenuTrigger asChild>
										<Button
											variant="outline"
											className="w-full justify-between"
											id="category"
										>
											{category
												? category.charAt(0).toUpperCase() + category.slice(1)
												: "Select a category"}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent>
										<DropdownMenuItem onClick={() => setCategory("payments")}>
											Payments
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => setCategory("refunds")}>
											Refunds
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => setCategory("orders")}>
											Orders
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => setCategory("accounts")}>
											Accounts
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => setCategory("products")}>
											Products
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="message">Message</Label>
							<Textarea
								id="message"
								placeholder="Describe your issue or question in detail..."
								className="min-h-[120px]"
								value={message}
								onChange={(e) => setMessage(e.target.value)}
							/>
						</div>
						<Button
							className="w-full"
							onClick={handleSubmit}
							disabled={loading}
						>
							{loading ? "Sending..." : "Send Message"}
						</Button>
					</CardContent>
				</Card>
			</motion.div> */}

			{/* Sent Messages */}
			{/* <motion.div
				custom={4}
				initial="hidden"
				animate="visible"
				variants={cardVariants}
			>
				<Card>
					<CardHeader>
						<CardTitle>Your Messages</CardTitle>
						<CardDescription>
							Review your submitted support requests
						</CardDescription>
					</CardHeader>
					<CardContent>
						{messages.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								No messages sent yet.
							</p>
						) : (
							<div className="space-y-4">
								{messages.map((msg) => (
									<div
										key={msg._id}
										className="flex items-center justify-between border p-3 rounded-lg"
									>
										<div>
											<p className="font-medium">{msg.subject}</p>
											<p className="text-sm text-muted-foreground">
												{msg.category} •{" "}
												{new Date(msg.createdAt).toLocaleString()}
											</p>
											<p className="text-xs text-muted-foreground">
												Status: {msg.status || "pending"}
											</p>
										</div>
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												setSelectedMessage(msg);
												setOpenDialog(true);
											}}
										>
											View
										</Button>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</motion.div> */}

			{/* Quick Links */}
			<motion.div
				custom={5}
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
							<Button
								variant="outline"
								className="justify-start"
								onClick={() => router.push("/terms-conditions")}
							>
								<FileText className="h-4 w-4 mr-2" />
								Terms of Service
								<ExternalLink className="h-4 w-4 ml-auto" />
							</Button>
							<Button
								variant="outline"
								className="justify-start"
								onClick={() => router.push("/privacy-policy")}
							>
								<FileText className="h-4 w-4 mr-2" />
								Privacy Policy
								<ExternalLink className="h-4 w-4 ml-auto" />
							</Button>
							<Button
								variant="outline"
								className="justify-start"
								onClick={() => router.push("/shipping-policy")}
							>
								<FileText className="h-4 w-4 mr-2" />
								Shipping Info
								<ExternalLink className="h-4 w-4 ml-auto" />
							</Button>
							<Button
								variant="outline"
								className="justify-start"
								onClick={() => router.push("/cancellation-refund-policy")}
							>
								<FileText className="h-4 w-4 mr-2" />
								Return Policy
								<ExternalLink className="h-4 w-4 ml-auto" />
							</Button>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* View Message Dialog */}
			<Dialog open={openDialog} onOpenChange={setOpenDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{selectedMessage?.subject}</DialogTitle>
						<DialogDescription>
							Category: {selectedMessage?.category}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-2">
						<p className="text-sm">{selectedMessage?.message}</p>
						<p className="text-xs text-muted-foreground">
							Submitted on:{" "}
							{selectedMessage
								? new Date(selectedMessage.createdAt).toLocaleString()
								: ""}
						</p>
						<p className="text-xs text-muted-foreground">
							Status: {selectedMessage?.status || "pending"}
						</p>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
