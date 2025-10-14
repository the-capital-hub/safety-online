"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tag, X, Loader2, ShoppingCart, CreditCard } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import useRequireAuth from "@/hooks/useRequireAuth.js";

export default function CartSummary() {
	const router = useRouter();
	const [couponCode, setCouponCode] = useState("");
	const requireAuth = useRequireAuth();

	const {
		totals,
		appliedPromo,
		applyPromoCode,
		removePromoCode,
		items,
		isLoading,
		recommendedCoupons,
		recommendedLoading,
		fetchRecommendedCoupons,
	} = useCartStore();

	useEffect(() => {
		fetchRecommendedCoupons();
	}, [fetchRecommendedCoupons]);

	const discountAmount = useMemo(() => {
		if (!appliedPromo) return 0;
		if (appliedPromo.discountAmount !== undefined) {
			return appliedPromo.discountAmount;
		}

		const discountValue = appliedPromo.discount || 0;
		return Math.round((totals.subtotal * discountValue) / 100);
	}, [appliedPromo, totals.subtotal]);

	const discountPercent = useMemo(() => {
		if (!appliedPromo) return 0;
		if (appliedPromo.discount !== undefined) {
			return appliedPromo.discount;
		}

		if (totals.subtotal === 0) return 0;
		return Math.round((discountAmount / totals.subtotal) * 100);
	}, [appliedPromo, discountAmount, totals.subtotal]);

	const handleApplyCoupon = async (codeOverride) => {
		const codeToApply = (codeOverride || couponCode).trim();
		if (!codeToApply) return;

		const success = await applyPromoCode(codeToApply);
		if (success && !codeOverride) {
			setCouponCode("");
		}
	};

	const handleCheckout = () => {
		if (!requireAuth({ message: "Please login to checkout" })) {
			return;
		}
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
							<div>
								<div className="flex items-center gap-2">
									<Tag className="h-4 w-4 text-green-600" />
									<span className="text-sm font-medium text-green-800">
										{appliedPromo.code}
									</span>
									{discountPercent > 0 && (
										<Badge className="bg-green-100 text-green-700">
											{discountPercent}% OFF
										</Badge>
									)}
								</div>
								{discountAmount > 0 && (
									<p className="text-xs text-green-700 mt-1">
										You saved ₹{discountAmount.toLocaleString()}
									</p>
								)}
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
									name="couponCode"
									placeholder="Enter coupon code"
									value={couponCode}
									onChange={(e) => setCouponCode(e.target.value)}
									className="flex-1"
									disabled={isLoading}
								/>
								<Button
									variant="outline"
									onClick={() => handleApplyCoupon()}
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
								Have a coupon? Enter it above or pick one from our
								recommendations.
							</p>
						</>
					)}

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<p className="text-sm font-medium text-gray-700">
								Recommended Coupons
							</p>
							{recommendedLoading && (
								<span className="text-xs text-gray-500">Loading...</span>
							)}
						</div>
						{!recommendedLoading && recommendedCoupons.length === 0 && (
							<p className="text-xs text-gray-500">
								No active coupons are available at the moment.
							</p>
						)}
						<div className="space-y-2">
							{recommendedCoupons.map((coupon) => {
								const isApplied = appliedPromo?.code === coupon.code;
								const expiryLabel = coupon.endDate
									? new Date(coupon.endDate).toLocaleDateString("en-IN", {
											month: "short",
											day: "numeric",
											year: "numeric",
									  })
									: null;

								return (
									<div
										key={coupon._id}
										className="flex items-center justify-between rounded-lg border border-dashed border-gray-200 p-3"
									>
										<div>
											<div className="flex items-center gap-2">
												<span className="font-semibold tracking-wide text-sm">
													{coupon.code}
												</span>
												<Badge variant="secondary" className="text-xs">
													{coupon.discount}% OFF
												</Badge>
											</div>
											{coupon.name && (
												<p className="text-xs text-gray-600 mt-1">
													{coupon.name}
												</p>
											)}
											{expiryLabel && (
												<p className="text-xs text-gray-400">
													Valid till {expiryLabel}
												</p>
											)}
										</div>
										<Button
											variant={isApplied ? "secondary" : "outline"}
											size="sm"
											disabled={isLoading || isApplied}
											onClick={() => handleApplyCoupon(coupon.code)}
										>
											{isApplied ? "Applied" : "Apply"}
										</Button>
									</div>
								);
							})}
						</div>
					</div>
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
							<span className="flex items-center gap-2">
								Discount
								{appliedPromo?.code && (
									<Badge className="bg-green-100 text-green-700">
										{appliedPromo.code}
									</Badge>
								)}
							</span>
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
