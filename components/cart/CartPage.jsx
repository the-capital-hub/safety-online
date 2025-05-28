"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/lib/store";
import CartItem from "@/components/cart/CartItem.jsx";

export default function CartPage() {
	const { items, getTotalPrice, getTotalItems, clearCart } = useCartStore();

	const totalPrice = getTotalPrice();
	const totalItems = getTotalItems();

	if (items.length === 0) {
		return (
			<div className="min-h-screen bg-gray-50">
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
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold">Your Cart</h1>
						<p className="text-gray-600">{totalItems} items in your cart</p>
					</div>
					<Link href="/products">
						<Button variant="outline">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Continue Shopping
						</Button>
					</Link>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Cart Items */}
					<div className="lg:col-span-2 space-y-4">
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

					{/* Order Summary */}
					<div className="lg:col-span-1">
						<Card className="sticky top-8">
							<CardContent className="p-6">
								<h2 className="text-xl font-semibold mb-6">Order Summary</h2>

								<div className="space-y-4 mb-6">
									<div className="flex justify-between">
										<span>Subtotal</span>
										<span>₹ {totalPrice.toLocaleString()}</span>
									</div>
									<div className="flex justify-between text-sm text-gray-600">
										<span>Tax included. Shipping calculated at checkout.</span>
									</div>
									<div className="text-sm text-gray-600">
										<span>Calculate Shipping</span>
									</div>
									<div className="border-t pt-4">
										<div className="flex justify-between font-semibold text-lg">
											<span>Total</span>
											<span>₹ {totalPrice.toLocaleString()}</span>
										</div>
									</div>
								</div>

								<div className="space-y-3">
									<Button
										className="w-full bg-black text-white hover:bg-gray-800"
										size="lg"
									>
										Check Out
										<ShoppingCart className="ml-2 h-4 w-4" />
									</Button>
									<Button variant="outline" className="w-full">
										Continue Shopping
									</Button>
									<Button
										variant="ghost"
										className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
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
		</div>
	);
}
