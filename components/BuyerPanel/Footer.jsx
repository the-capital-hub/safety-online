"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Facebook, Instagram, Linkedin } from "lucide-react";
import { Barcode, AppStore, GooglePlay } from "@/public/images/home/index.js";

export default function Footer() {
	const footerSections = {
		support: {
			title: "Support",
			items: ["hello@safetyonline.in", "9945234161"],
		},
		account: {
			title: "Account",
			items: ["My Account", "Login / Register", "Cart", "Wishlist", "Shop"],
		},
		quickLinks: {
			title: "Quick Link",
			items: ["Privacy Policy", "Terms Of Use", "FAQ", "Contact"],
		},
	};

	return (
		<footer className="bg-black text-white py-8 md:py-16">
			<div className="px-10">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
					{/* Newsletter */}
					<div className="lg:col-span-1">
						<h3 className="text-xl font-bold mb-4">Exclusive</h3>
						<h4 className="text-lg mb-4">Subscribe</h4>
						<p className="text-gray-400 mb-6">
							Get 10% off on your first order
						</p>
						<div className="flex">
							<Input
								placeholder="Enter your email"
								className="bg-transparent border-white/20  border-r-0 text-white placeholder-gray-400 rounded-r-none"
							/>
							<Button
								variant="ghost"
								size="icon"
								className="text-white border border-l-0 border-white/20 rounded-l-none"
							>
								<ArrowRight className="h-4 w-4" />
							</Button>
						</div>
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
								<p
									key={index}
									className="hover:text-white cursor-pointer transition-colors"
								>
									{item}
								</p>
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
								<p
									key={index}
									className="hover:text-white cursor-pointer transition-colors"
								>
									{item}
								</p>
							))}
						</div>
					</div>

					{/* Download App */}
					<div>
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
						<div className="flex space-x-4">
							<Facebook className="h-6 w-6 hover:text-blue-400 cursor-pointer transition-colors" />
							<Instagram className="h-6 w-6 hover:text-pink-400 cursor-pointer transition-colors" />
							<Linkedin className="h-6 w-6 hover:text-blue-600 cursor-pointer transition-colors" />
						</div>
					</div>
				</div>

				<div className="border-t border-white/20 mt-8 md:mt-12 pt-8 text-center text-gray-400">
					<p>© Copyright Rimel 2022. All right reserved</p>
				</div>
			</div>
		</footer>
	);
}
