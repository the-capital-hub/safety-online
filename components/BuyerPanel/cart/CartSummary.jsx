"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tag, X, Loader2, ShoppingCart, CreditCard } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";

export default function CartSummary() {
	const router = useRouter();
	const [couponCode, setCouponCode] = useState("");

	const {
		totals,
		appliedPromo,
		applyPromoCode,
		removePromoCode,
		items,
		isLoading,
	} = useCartStore();

	const handleApplyCoupon = async () => {
		if (!couponCode.trim()) return;

		const success = await applyPromoCode(couponCode.trim());
		if (success) {
			setCouponCode("");
		}
	};

	const handleCheckout = () => {
		router.push("/checkout");
	};

	const handleContinueShopping = () => {
		router.push("/products");
	};

	return (
		<Card className="sticky top-4">
			<CardHeader>
				<CardTitle>Order Summary</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Coupon Section */}
				<div className="space-y-3">
					{appliedPromo ? (
						<div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
							<div className="flex items-center gap-2">
								<Tag className="h-4 w-4 text-green-600" />
								<span className="text-sm font-medium text-green-800">
									{appliedPromo.code}
								</span>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={removePromoCode}
								className="text-red-600 hover:text-red-700"
								disabled={isLoading}
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					) : (
						<>
							<div className="flex gap-2">
								<Input
									placeholder="Enter coupon code"
									value={couponCode}
									onChange={(e) => setCouponCode(e.target.value)}
									className="flex-1"
									disabled={isLoading}
								/>
								<Button
									variant="outline"
									onClick={handleApplyCoupon}
									disabled={isLoading || !couponCode.trim()}
								>
									{isLoading ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										"Apply"
									)}
								</Button>
							</div>
							<p className="text-xs text-gray-500">
								Try "MQXE0KDU" for 20% off
							</p>
						</>
					)}
				</div>

				<Separator />

				{/* Order Breakdown */}
				<div className="space-y-2">
					<div className="flex justify-between">
						<span>
							Subtotal ({items.length} {items.length === 1 ? "item" : "items"})
						</span>
						<span>₹{totals.subtotal.toLocaleString()}</span>
					</div>
					{totals.discount > 0 && (
						<div className="flex justify-between text-green-600">
							<span>Discount</span>
							<span>-₹{totals.discount.toLocaleString()}</span>
						</div>
					)}

					<Separator />

					<div className="flex justify-between font-bold text-lg">
						<span>Total</span>
						<span>₹{totals.total.toLocaleString()}</span>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="space-y-3 pt-4">
					<Button
						onClick={handleCheckout}
						className="w-full bg-black text-white hover:bg-gray-800"
						size="lg"
						disabled={items.length === 0 || isLoading}
					>
						<CreditCard className="h-4 w-4 mr-2" />
						Proceed to Checkout
					</Button>

					<Button
						onClick={handleContinueShopping}
						variant="outline"
						className="w-full bg-transparent"
						size="lg"
					>
						Continue Shopping
					</Button>
				</div>

				{/* Note about shipping */}
				<div className="text-center pt-4">
					<p className="text-xs text-gray-500">
						Shipping and taxes calculated at checkout
					</p>
					<div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-2">
						<div className="w-3 h-3 bg-green-500 rounded-full" />
						<span>Secure checkout with SSL encryption</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
