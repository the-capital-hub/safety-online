"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, ArrowLeft, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore.js";
import CartItem from "@/components/BuyerPanel/cart/CartItem.jsx";
import CartSummary from "@/components/BuyerPanel/cart/CartSummary.jsx";

export default function CartPage() {
	const router = useRouter();
	const {
		items,
		isLoading,
		syncError,
		clearCartLocal,
		forceSync,
		isAuthenticated,
	} = useCartStore();

	useEffect(() => {
		// Sync with server on page load if authenticated
		if (isAuthenticated) {
			forceSync();
		}
	}, [isAuthenticated, forceSync]);

	const handleClearCart = () => {
		if (window.confirm("Are you sure you want to clear your cart?")) {
			clearCartLocal();
		}
	};

	const handleGoBack = () => {
		router.back();
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<div className="container mx-auto px-4 py-8">
					<div className="flex items-center justify-center min-h-[400px]">
						<div className="text-center">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
							<p className="text-gray-600">Loading your cart...</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (syncError) {
		return (
			<div className="min-h-screen bg-gray-50">
				<div className="container mx-auto px-4 py-8">
					<div className="flex items-center justify-center min-h-[400px]">
						<Card className="w-full max-w-md">
							<CardContent className="p-6 text-center">
								<div className="text-red-500 mb-4">
									<ShoppingCart className="h-12 w-12 mx-auto" />
								</div>
								<h2 className="text-xl font-semibold mb-2">
									Error Loading Cart
								</h2>
								<p className="text-gray-600 mb-4">{syncError}</p>
								<Button onClick={() => forceSync()} className="w-full">
									Try Again
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 hide-scrollbar">
			<div className="py-8 px-10">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center gap-4">
						<Button variant="outline" size="icon" onClick={handleGoBack}>
							<ArrowLeft className="h-4 w-4" />
						</Button>
						<div>
							<h1 className="text-3xl font-bold">Shopping Cart</h1>
							<p className="text-gray-600">
								{items.length === 0
									? "Your cart is empty"
									: `${items.length} item${
											items.length > 1 ? "s" : ""
									  } in your cart`}
							</p>
						</div>
					</div>

					{items.length > 0 && (
						<Button
							variant="outline"
							onClick={handleClearCart}
							className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
						>
							<Trash2 className="h-4 w-4 mr-2" />
							Clear Cart
						</Button>
					)}
				</div>

				{items.length === 0 ? (
					/* Empty Cart State */
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-center py-16"
					>
						<Card className="max-w-md mx-auto">
							<CardContent className="p-8">
								<div className="text-gray-400 mb-6">
									<ShoppingCart className="h-24 w-24 mx-auto" />
								</div>
								<h2 className="text-2xl font-semibold mb-4">
									Your cart is empty
								</h2>
								<p className="text-gray-600 mb-6">
									Looks like you haven't added any items to your cart yet.
								</p>
								<Button
									onClick={() => router.push("/products")}
									className="w-full bg-black text-white hover:bg-gray-800"
									size="lg"
								>
									Start Shopping
								</Button>
							</CardContent>
						</Card>
					</motion.div>
				) : (
					/* Cart with Items */
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Cart Items */}
						<div className="lg:col-span-2 space-y-4">
							<AnimatePresence mode="popLayout">
								{items.map((item) => (
									<CartItem key={item.id} item={item} />
								))}
							</AnimatePresence>

							{/* Recommended Products Section */}
							<Card className="mt-8">
								<CardContent className="p-6">
									<h3 className="text-lg font-semibold mb-4">
										You might also like
									</h3>
									<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
										{[1, 2, 3, 4].map((i) => (
											<div key={i} className="text-center">
												<div className="w-full h-24 bg-gray-100 rounded-lg mb-2"></div>
												<p className="text-sm font-medium">Product {i}</p>
												<p className="text-sm text-gray-600">₹999</p>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Cart Summary */}
						<div className="lg:col-span-1">
							<CartSummary />
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
