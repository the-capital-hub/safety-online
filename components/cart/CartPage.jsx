"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ShoppingCart, Mail } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/lib/store";
import CartItem from "@/components/cart/CartItem.jsx";

export default function CartPage() {
	const { items, getTotalPrice, getTotalItems, clearCart } = useCartStore();
	const [promoCode, setPromoCode] = useState("");
	const [appliedPromo, setAppliedPromo] = useState(null);
	const [email, setEmail] = useState("");

	const totalPrice = getTotalPrice();
	const totalItems = getTotalItems();

	// Calculate discount (20% if promo applied)
	const discountPercentage = appliedPromo ? 20 : 0;
	const discountAmount = (totalPrice * discountPercentage) / 100;
	const deliveryFee = 15;
	const finalTotal = totalPrice - discountAmount + deliveryFee;

	const handleApplyPromo = () => {
		if (promoCode.toLowerCase() === "save20") {
			setAppliedPromo({ code: promoCode, discount: 20 });
		} else {
			setAppliedPromo(null);
		}
	};

	const handleNewsletterSubmit = (e) => {
		e.preventDefault();
		// Handle newsletter subscription
		console.log("Newsletter subscription:", email);
		setEmail("");
	};

	if (items.length === 0) {
		return (
			<div className="min-h-[calc(100vh-68px)] bg-gray-50">
				<div className="container mx-auto px-4 py-16">
					<div className="text-center">
						<ShoppingCart className="h-24 w-24 mx-auto text-gray-300 mb-6" />
						<h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
						<p className="text-gray-600 mb-8">
							Add some products to get started!
						</p>
						<Link href="/products">
							<Button className="bg-black text-white hover:bg-gray-800">
								Continue Shopping
							</Button>
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8 px-10">
			<div className="mb-10">
				{/* Header */}
				<div className="flex flex-col-reverse md:flex-row gap-4 md:gap-0 md:items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold">Your Cart</h1>
						<p className="text-gray-600">{totalItems} items in your cart</p>
					</div>
					<Link href="/products">
						<Button variant="outline" className="rounded-full">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Continue Shopping
						</Button>
					</Link>
				</div>

				<div className="flex flex-col lg:flex-row gap-8">
					{/* Cart Items - Scrollable */}
					<div className="flex-1 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto lg:pr-4">
						<div className="space-y-4">
							{items.map((item, index) => (
								<motion.div
									key={item.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
								>
									<CartItem item={item} />
								</motion.div>
							))}
						</div>
					</div>

					{/* Order Summary - Sticky */}
					<div className="lg:w-96">
						<Card className="lg:sticky lg:top-8">
							<CardContent className="p-6">
								<h2 className="text-xl font-semibold mb-6">Order Summary</h2>

								<div className="space-y-4 mb-6">
									<div className="flex justify-between">
										<span>Subtotal</span>
										<span>₹{totalPrice.toLocaleString()}</span>
									</div>

									{appliedPromo && (
										<div className="flex justify-between text-red-600">
											<span>Discount (-{discountPercentage}%)</span>
											<span>-₹{discountAmount.toLocaleString()}</span>
										</div>
									)}

									<div className="flex justify-between">
										<span>Delivery Fee</span>
										<span>₹{deliveryFee}</span>
									</div>

									<div className="border-t pt-4">
										<div className="flex justify-between font-semibold text-lg">
											<span>Total</span>
											<span>₹{finalTotal.toLocaleString()}</span>
										</div>
									</div>
								</div>

								{/* Promo Code */}
								<div className="mb-6">
									<div className="flex gap-2">
										<Input
											placeholder="Add promo code"
											value={promoCode}
											onChange={(e) => setPromoCode(e.target.value)}
											className="flex-1 rounded-full"
										/>
										<Button
											onClick={handleApplyPromo}
											className="bg-black text-white hover:bg-gray-800 rounded-full"
										>
											Apply
										</Button>
									</div>
									{appliedPromo && (
										<p className="text-green-600 text-sm mt-2">
											Promo code "{appliedPromo.code}" applied successfully!
										</p>
									)}
								</div>

								<div className="space-y-3">
									<Button
										className="w-full bg-black text-white hover:bg-gray-800 rounded-full"
										size="lg"
									>
										Go to Checkout →
									</Button>
									{/* <Button variant="outline" className="w-full bg-transparent">
										Continue Shopping
									</Button> */}
									<Button
										variant="ghost"
										className="w-full text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-full"
										onClick={clearCart}
									>
										Clear Cart
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>

			{/* Newsletter Banner */}
			<div className="bg-black text-white px-10 py-12 rounded-2xl">
				<div className="container mx-auto px-4">
					<div className="flex flex-col lg:flex-row items-center justify-between gap-8">
						<div className="text-center lg:text-left">
							<h2 className="text-3xl lg:text-4xl font-bold mb-2">
								STAY UP TO DATE ABOUT
							</h2>
							<h2 className="text-3xl lg:text-4xl font-bold">
								OUR LATEST OFFERS
							</h2>
						</div>
						<div className="w-full lg:w-auto lg:min-w-[400px]">
							<form onSubmit={handleNewsletterSubmit} className="space-y-4">
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
									<Input
										type="email"
										placeholder="Enter your email address"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="pl-10 bg-white text-black rounded-full h-12"
										required
									/>
								</div>
								<Button
									type="submit"
									className="w-full bg-white text-black hover:bg-gray-100 rounded-full h-12 font-semibold"
								>
									Subscribe to Newsletter
								</Button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
