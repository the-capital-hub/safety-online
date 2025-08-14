"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, X, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function MiniCart() {
	const router = useRouter();
	const {
		items,
		isOpen,
		closeCart,
		totals,
		updateQuantity,
		removeItem,
		getTotalItems,
		isLoading,
	} = useCartStore();

	const handleViewCart = () => {
		closeCart();
		router.push("/cart");
	};

	const handleCheckout = () => {
		closeCart();
		router.push("/checkout");
	};

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 bg-black bg-opacity-50 z-50"
				onClick={closeCart}
			>
				<motion.div
					initial={{ x: "100%" }}
					animate={{ x: 0 }}
					exit={{ x: "100%" }}
					className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl"
					onClick={(e) => e.stopPropagation()}
				>
					<Card className="h-full rounded-none border-0 flex flex-col">
						<CardHeader className="flex-shrink-0">
							<div className="flex items-center justify-between">
								<CardTitle className="flex items-center gap-2">
									<ShoppingCart className="h-5 w-5" />
									Cart ({getTotalItems()})
								</CardTitle>
								<Button variant="ghost" size="icon" onClick={closeCart}>
									<X className="h-4 w-4" />
								</Button>
							</div>
						</CardHeader>

						<CardContent className="flex-1 flex flex-col p-0">
							{items.length === 0 ? (
								<div className="flex-1 flex items-center justify-center p-6">
									<div className="text-center">
										<ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
										<p className="text-gray-600">Your cart is empty</p>
									</div>
								</div>
							) : (
								<>
									{/* Cart Items */}
									<div className="flex-1 overflow-y-auto p-4 space-y-4">
										{items.map((item) => (
											<div
												key={item.id}
												className="flex gap-3 p-3 border rounded-lg"
											>
												<div className="relative w-16 h-16 bg-gray-50 rounded flex-shrink-0">
													<Image
														src={
															item.image ||
															"https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png"
														}
														alt={item.name}
														fill
														className="object-contain p-1"
													/>
												</div>
												<div className="flex-1 min-w-0">
													<h4 className="font-medium text-sm line-clamp-2 mb-1">
														{item.name}
													</h4>
													<p className="text-sm font-bold">
														₹{item.price.toLocaleString()}
													</p>
													<div className="flex items-center justify-between mt-2">
														<div className="flex items-center gap-1">
															<Button
																variant="outline"
																size="icon"
																className="h-6 w-6 bg-transparent"
																onClick={() =>
																	updateQuantity(item.id, item.quantity - 1)
																}
																disabled={isLoading}
															>
																<Minus className="h-3 w-3" />
															</Button>
															<span className="text-sm w-8 text-center">
																{item.quantity}
															</span>
															<Button
																variant="outline"
																size="icon"
																className="h-6 w-6 bg-transparent"
																onClick={() =>
																	updateQuantity(item.id, item.quantity + 1)
																}
																disabled={isLoading}
															>
																<Plus className="h-3 w-3" />
															</Button>
														</div>
														<Button
															variant="ghost"
															size="sm"
															className="text-red-600 hover:text-red-700 p-1"
															onClick={() => removeItem(item.id)}
															disabled={isLoading}
														>
															<X className="h-3 w-3" />
														</Button>
													</div>
												</div>
											</div>
										))}
									</div>

									{/* Cart Summary */}
									<div className="flex-shrink-0 p-4 border-t bg-gray-50">
										<div className="space-y-2 mb-4">
											<div className="flex justify-between text-sm">
												<span>Subtotal</span>
												<span>₹{totals.subtotal.toLocaleString()}</span>
											</div>
											{totals.discount > 0 && (
												<div className="flex justify-between text-sm text-green-600">
													<span>Discount</span>
													<span>-₹{totals.discount.toLocaleString()}</span>
												</div>
											)}
											<Separator />
											<div className="flex justify-between font-bold">
												<span>Total</span>
												<span>₹{totals.total.toLocaleString()}</span>
											</div>
										</div>

										<div className="space-y-2">
											<Button
												onClick={handleCheckout}
												className="w-full bg-black text-white hover:bg-gray-800"
												disabled={isLoading}
											>
												Checkout
											</Button>
											<Button
												onClick={handleViewCart}
												variant="outline"
												className="w-full bg-transparent"
												disabled={isLoading}
											>
												View Cart
											</Button>
										</div>

										<p className="text-xs text-gray-500 text-center mt-3">
											Shipping calculated at checkout
										</p>
									</div>
								</>
							)}
						</CardContent>
					</Card>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
