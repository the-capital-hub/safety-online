"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Facebook, Instagram, Linkedin } from "lucide-react";
// import { Barcode, AppStore, GooglePlay } from "@/public/images/home/index.js";
import Link from "next/link";
import Logo from "@/public/LogoSeller1.png";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function Footer() {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubscribe = async (e) => {
		e.preventDefault();

		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			toast.error("Please enter a valid email address");
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch("/api/newsletter/subscribe", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to subscribe");
			}

			toast.success(data.message || "Subscribed successfully!");
			setEmail("");
		} catch (error) {
			toast.error(error.message || "Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const footerSections = {
		support: {
			title: "Support",
			items: ["help@safetyonline.in", "+91 9945234161"],
		},
		account: {
			title: "Account",
			items: [
				{ label: "My Account", href: "/account/profile" },
				{ label: "Login / Register", href: "/login" },
				{ label: "Cart", href: "/cart" },
				{ label: "Wishlist", href: "/wishlist" },
				{ label: "Shop", href: "/products" },
			],
		},
		quickLinks: {
			title: "Quick Link",
			items: [
				{ label: "Privacy Policy", href: "/privacy-policy" },
				{ label: "Terms Of Use", href: "/terms-conditions" },
				{ label: "Pricing Policy", href: "/pricing-policy" },
				{ label: "Shipping Policy", href: "/shipping-policy" },
				{ label: "Refund Policy", href: "/cancellation-refund-policy" },
				{ label: "Help", href: "/account/help" },
			],
		},
	};

	return (
		<footer className="bg-black text-white py-8 md:py-16">
			<div className="px-10">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
					{/* Newsletter */}
					<div className="lg:col-span-1">
						{/* Logo Image */}
						<Image
							src={Logo}
							width={200}
							height={200}
							alt="Logo"
							className="mb-4"
						/>

						<h3 className="text-lg mb-4">Find us on</h3>

						<div className="flex space-x-4">
							<Facebook className="h-6 w-6 hover:text-blue-400 cursor-pointer transition-colors" />
							<Instagram className="h-6 w-6 hover:text-pink-400 cursor-pointer transition-colors" />
							<Linkedin className="h-6 w-6 hover:text-blue-600 cursor-pointer transition-colors" />
						</div>

						<Link href="/blog" className="mt-6 inline-block">
							<Button
								variant="secondary"
								className="bg-white text-black hover:bg-white/90"
							>
								Visit our Blog
							</Button>
						</Link>
					</div>

					{/* Support */}
					<div>
						<h3 className="text-xl font-bold mb-4">
							{footerSections.support.title}
						</h3>
						<div className="space-y-3 text-gray-400">
							{footerSections.support.items.map((item, index) => (
								<p
									key={index}
									className="hover:text-white cursor-pointer transition-colors"
								>
									{item}
								</p>
							))}
						</div>
					</div>

					{/* Account */}
					<div>
						<h3 className="text-xl font-bold mb-4">
							{footerSections.account.title}
						</h3>
						<div className="space-y-3 text-gray-400">
							{footerSections.account.items.map((item, index) => (
								<Link
									href={item.href}
									key={index}
									className="hover:text-white flex flex-col cursor-pointer transition-colors"
								>
									{item.label}
								</Link>
							))}
						</div>
					</div>

					{/* Quick Links */}
					<div>
						<h3 className="text-xl font-bold mb-4">
							{footerSections.quickLinks.title}
						</h3>
						<div className="space-y-3 text-gray-400">
							{footerSections.quickLinks.items.map((item, index) => (
								<Link
									href={item.href}
									key={index}
									className="flex flex-col hover:text-white cursor-pointer transition-colors"
								>
									{item.label}
								</Link>
							))}
						</div>
					</div>

					{/* Newsletter */}
					<div>
						<h3 className="text-xl font-bold mb-4">Subscribe</h3>

						<p className="text-gray-400 mb-6">
							Subscribe to our newsletter to get exclusive offers
						</p>
						<form onSubmit={handleSubscribe} className="flex">
							<Input
								name="newsletterEmail"
								placeholder="Enter your email"
								className="bg-transparent border-white/20 border-r-0 text-white placeholder-gray-400 rounded-r-none"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={isLoading}
								required
							/>
							<Button
								variant="ghost"
								size="icon"
								type="submit"
								className="text-white border border-l-0 border-white/20 rounded-l-none"
								disabled={isLoading}
							>
								{isLoading ? (
									<span className="animate-spin">↻</span>
								) : (
									<ArrowRight className="h-4 w-4" />
								)}
							</Button>
						</form>

						{/* </div>
						<h3 className="text-xl font-bold mb-4">Download App</h3>
						<p className="text-gray-400 mb-4">Save $3 with App New User Only</p>
						<div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-0 lg:space-y-4 xl:space-y-0 xl:space-x-4 mb-6">
							<Image
								src={Barcode}
								alt="Google Play"
								width={88}
								height={88}
								className="w-[88px] h-[88px] object-cover flex-shrink-0"
							/>
							<div className="space-y-2">
								<Image
									src={GooglePlay}
									alt="Google Play"
									width={128}
									height={40}
									className="w-32 h-10 object-cover border rounded-lg cursor-pointer"
								/>
								<Image
									src={AppStore}
									alt="App Store"
									width={128}
									height={40}
									className="w-32 h-10 object-cover border rounded-lg cursor-pointer"
								/>
							</div>
						</div>
					</div> */}
					</div>
				</div>

				<div className="border-t border-white/20 mt-8 md:mt-12 pt-8 text-center text-gray-400">
					<p>© Copyright Safety Online 2025. All right reserved</p>
				</div>
			</div>
		</footer>
	);
}
