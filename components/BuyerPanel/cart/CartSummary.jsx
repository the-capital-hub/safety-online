"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tag, X, ShoppingBag, CreditCard } from "lucide-react";
import { useCartStore } from "@/store/cartStore.js";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function CartSummary() {
	const [promoCode, setPromoCode] = useState("");
	const [isApplyingPromo, setIsApplyingPromo] = useState(false);
	const router = useRouter();

	const {
		totals,
		appliedPromo,
		applyPromoCode,
		removePromoCode,
		items,
		isLoading,
	} = useCartStore();

	const handleApplyPromo = async () => {
		if (!promoCode.trim()) return;

		setIsApplyingPromo(true);
		const success = await applyPromoCode(promoCode);
		console.log("Promo applied:", success);
		if (success) {
			toast.success("Promo code applied!");
			setPromoCode("");
		} else {
			toast.error("Invalid Promo Code");
		}
		setIsApplyingPromo(false);
	};

	const handleRemovePromo = () => {
		removePromoCode();
	};

	const handleCheckout = () => {
		router.push("/checkout");
	};

	const handleContinueShopping = () => {
		router.push("/products");
	};

	return (
		<Card className="sticky top-20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ShoppingBag className="h-5 w-5" />
					Order Summary
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Promo Code Section */}
				<div className="space-y-3">
					{appliedPromo ? (
						<div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
							<div className="flex items-center gap-2">
								<Tag className="h-4 w-4 text-green-600" />
								<span className="text-sm font-medium text-green-800">
									{appliedPromo.code}
								</span>
								<Badge
									variant="secondary"
									className="bg-green-100 text-green-800"
								>
									{appliedPromo.discount}% OFF
								</Badge>
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="h-6 w-6 text-green-600 hover:text-green-700"
								onClick={handleRemovePromo}
							>
								<X className="h-3 w-3" />
							</Button>
						</div>
					) : (
						<div className="space-y-2">
							<div className="flex gap-2">
								<Input
									placeholder="Enter promo code"
									value={promoCode}
									onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
									className="flex-1"
									onKeyPress={(e) => e.key === "Enter" && handleApplyPromo()}
								/>
								<Button
									onClick={handleApplyPromo}
									disabled={!promoCode.trim() || isApplyingPromo}
									variant="outline"
								>
									{isApplyingPromo ? "Applying..." : "Apply"}
								</Button>
							</div>
							<p className="text-xs text-gray-500">
								Try "MQXE0KDU" for 20% off
							</p>
						</div>
					)}
				</div>

				<Separator />

				{/* Order Breakdown */}
				<div className="space-y-3">
					<div className="flex justify-between text-sm">
						<span>Subtotal ({items.length} items)</span>
						<span>₹{totals.subtotal.toLocaleString()}</span>
					</div>

					{totals.discount > 0 && (
						<div className="flex justify-between text-sm text-green-600">
							<span>Discount</span>
							<span>-₹{totals.discount.toLocaleString()}</span>
						</div>
					)}

					<div className="flex justify-between text-sm">
						<span>Delivery Fee</span>
						<span>
							{totals.deliveryFee > 0 ? `₹${totals.deliveryFee}` : "FREE"}
						</span>
					</div>

					<Separator />

					<div className="flex justify-between text-lg font-bold">
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

				{/* Security Badge */}
				<div className="text-center pt-4">
					<div className="flex items-center justify-center gap-2 text-xs text-gray-500">
						<div className="w-3 h-3 bg-green-500 rounded-full" />
						<span>Secure checkout with SSL encryption</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
