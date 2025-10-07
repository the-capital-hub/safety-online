"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useIsAuthenticated, useLoggedInUser } from "@/store/authStore.js";

function normalizeOrderProducts(orderData) {
        if (!orderData) return [];

        const products = Array.isArray(orderData.products) ? orderData.products : [];
        if (products.length > 0) {
                return products.map((item) => ({
                        ...item,
                        productId: item.productId?._id || item.productId,
                }));
        }

        const subOrders = Array.isArray(orderData.subOrders) ? orderData.subOrders : [];
        const flattened = [];

        subOrders.forEach((subOrder) => {
                (subOrder?.products || []).forEach((item) => {
                        const productId = item.productId?._id || item.productId;
                        flattened.push({
                                productId,
                                productName:
                                        item.productId?.name || item.productName || item?.name || "Product",
                                productImage:
                                        item.productId?.images?.[0] || item.productImage || item?.image || null,
                                quantity: item.quantity ?? item.productId?.quantity ?? 0,
                                price: item.price ?? item.productId?.price ?? 0,
                                totalPrice:
                                        item.totalPrice ??
                                        (item.price ?? item.productId?.price ?? 0) * (item.quantity ?? 0),
                        });
                });
        });

        return flattened;
}

function StarRating({ value, onChange, size = 22 }) {
	const stars = [1, 2, 3, 4, 5];
	return (
		<div className="flex items-center gap-1">
			{stars.map((s) => (
				<button
					key={s}
					type="button"
					aria-label={`Rate ${s} star`}
					onClick={() => onChange(s)}
					className={
						s <= value ? "text-yellow-500" : "text-muted-foreground/40"
					}
				>
					<svg
						width={size}
						height={size}
						viewBox="0 0 24 24"
						fill={s <= value ? "currentColor" : "none"}
						stroke="currentColor"
						strokeWidth="1.5"
					>
						<path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
					</svg>
				</button>
			))}
		</div>
	);
}

function ImagePicker({ files, onAdd, onRemove, name }) {
	return (
		<div className="space-y-3">
			<div className="flex items-center gap-3">
                                <Input
                                        name="reviewImages"
                                        type="file"
					multiple
					accept="image/*"
					onChange={(e) => onAdd(Array.from(e.target.files || []))}
					aria-label="Add product images"
				/>
			</div>
			{files.length > 0 && (
				<div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
					{files.map((f, idx) => {
						const url = URL.createObjectURL(f);
						return (
							<div
								key={idx}
								className="relative rounded-md overflow-hidden border"
							>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={url || "/placeholder.svg"}
									alt={`${name} image ${idx + 1}`}
									className="h-24 w-full object-cover"
								/>
								<button
									type="button"
									onClick={() => onRemove(idx)}
									className="absolute right-1 top-1 rounded bg-black/60 px-1 text-xs text-white"
									aria-label="Remove image"
								>
									✕
								</button>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

export default function ReviewOrderPage() {
        const isAuthenticated = useIsAuthenticated();
        const user = useLoggedInUser();
	// console.log("user", user, "isAuthenticated", isAuthenticated);
	const params = useParams();
	const router = useRouter();
	const { orderId } = params || {};
	const [loading, setLoading] = useState(true);
        const [order, setOrder] = useState(null);
	const [submitting, setSubmitting] = useState(false);
	const [form, setForm] = useState({}); // keyed by productId: { rating, title, comment, files[] }
	const [reviewSuccess, setReviewSuccess] = useState(false);

        useEffect(() => {
                if (!isAuthenticated) {
                        router.push("/login");
                }
                async function load() {
                        try {
                                const res = await fetch(`/api/orders/${orderId}`);
                                const data = await res.json();
                                if (data?.success) {
                                        const normalizedOrder = {
                                                ...data.order,
                                                products: normalizeOrderProducts(data.order),
                                        };
                                        setOrder(normalizedOrder);
                                        // initialize form state for each product
                                        const initial = {};
                                        normalizedOrder.products.forEach((p) => {
                                                const productKey = p.productId?.toString?.() || p.productId;
                                                initial[productKey] = {
                                                        rating: 5,
                                                        title: "",
                                                        comment: "",
                                                        files: [],
                                                };
                                        });
                                        setForm(initial);
                                }
                        } catch (e) {
                                console.error("load order for review error", e);
			} finally {
				setLoading(false);
			}
		}
		if (orderId) load();
	}, [orderId]);

        const products = order?.products ?? [];

        const allValid = useMemo(() => {
                if (Object.keys(form).length === 0) return false;
                return Object.values(form).every(
                        (f) => f && f.rating >= 1 && (f.comment?.trim()?.length || 0) >= 10
                );
        }, [form]);

	const handleFilesAdd = (productId, files) => {
		setForm((prev) => ({
			...prev,
			[productId]: {
				...(prev[productId] || {}),
				files: [...(prev[productId]?.files || []), ...files],
			},
		}));
	};

	const handleFilesRemove = (productId, idx) => {
		setForm((prev) => {
			const current = prev[productId] || { files: [] };
			const nextFiles = current.files.filter((_, i) => i !== idx);
			return { ...prev, [productId]: { ...current, files: nextFiles } };
		});
	};

	const submitReviews = async () => {
		try {
			setSubmitting(true);

			// 1) Upload all images per product
                        const payloadReviews = [];
                        for (const p of products) {
                                const productKey = p.productId?.toString?.() || p.productId;
                                const state = form[productKey];
                                if (!state) continue;
                                const imageUrls = [];

                                if (state.files && state.files.length > 0) {
					// upload sequentially to simplify
					for (const f of state.files) {
						const fd = new FormData();
						fd.append("file", f);
						const up = await fetch("/api/upload", { method: "POST", body: fd });
						const upData = await up.json();
						if (up.ok && upData?.url) imageUrls.push(upData.url);
					}
				}

                                payloadReviews.push({
                                        productId: p.productId,
                                        rating: state.rating,
                                        title: state.title?.trim(),
                                        comment: state.comment?.trim(),
                                        images: imageUrls,
                                });
			}

			// 2) Create reviews in backend (bulk)
			const res = await fetch("/api/reviews", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId: user._id,
					orderId,
					reviews: payloadReviews,
				}),
			});
			const data = await res.json();
			if (res.ok && data?.success) {
				setReviewSuccess(true);
				// router.push(`/orders?review=success`);
			} else {
				setReviewSuccess(false);
				throw new Error(data?.message || "Failed to submit reviews");
			}
		} catch (e) {
			console.error("submit reviews error:", e);
			alert(e.message);
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-10">
				<p className="text-muted-foreground">Loading order...</p>
			</div>
		);
	}

	if (!order) {
		return (
			<div className="container mx-auto px-4 py-10">
				<p className="text-red-600">Order not found.</p>
			</div>
		);
	}

	if (reviewSuccess) {
		return (
			<div className="container mx-auto px-4 py-10">
				<p className="text-green-600 mb-10">Review submitted successfully.</p>
				<Button onClick={() => router.back()}>Go back</Button>
			</div>
		);
	}

	// console.log("order", order);

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">
						Rate & Review Products
					</h1>
					<p className="text-sm text-muted-foreground">
						Order #{order.orderNumber} •{" "}
						{new Date(order.orderDate).toLocaleDateString()}
					</p>
				</div>
                                <Badge variant="secondary">{products.length} items</Badge>
			</div>

			<div className="grid gap-6">
                                {products.length === 0 ? (
                                        <p className="text-muted-foreground text-sm">
                                                No products available to review for this order.
                                        </p>
                                ) : (
                                        products.map((item) => {
                                                const productKey = item.productId?.toString?.() || item.productId;
                                                const state = form[productKey] || {
                                                        rating: 5,
                                                        title: "",
                                                        comment: "",
                                                        files: [],
                                                };
                                                return (
                                                        <motion.div
                                                                key={productKey}
                                                                initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
						>
							<Card className="overflow-hidden">
                                                                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                                        <div className="flex items-center gap-4">
                                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                                <Image
                                                                                        src={item.productImage || "/placeholder.svg"}
											alt={item.productName}
											width={64}
											height={64}
											className="h-16 w-16 rounded-md object-cover"
										/>
										<div>
											<CardTitle className="text-lg">
												{item.productName}
											</CardTitle>
											<p className="text-sm text-muted-foreground">
												Qty: {item.quantity}
											</p>
										</div>
									</div>
                                                                                <StarRating
                                                                                        value={state.rating}
                                                                                        onChange={(v) =>
                                                                                                setForm((prev) => ({
                                                                                                        ...prev,
                                                                                                        [productKey]: {
                                                                                                                ...(prev[productKey] || {}),
                                                                                                                rating: v,
                                                                                                        },
                                                                                                }))
										}
									/>
								</CardHeader>
								<CardContent className="space-y-4">
                                                                        <Input
                                                                                name="reviewTitle"
                                                                                placeholder="Title (optional)"
                                                                                value={state.title}
                                                                                onChange={(e) =>
                                                                                        setForm((prev) => ({
                                                                                                ...prev,
                                                                                                [productKey]: {
                                                                                                        ...(prev[productKey] || {}),
                                                                                                        title: e.target.value,
                                                                                                },
                                                                                        }))
                                                                        }
									/>
                                                                        <Textarea
                                                                                name="reviewComment"
                                                                                placeholder="Share details about quality, comfort, size, delivery experience, etc. Minimum 10 characters."
										rows={5}
                                                                                value={state.comment}
                                                                                onChange={(e) =>
                                                                                        setForm((prev) => ({
                                                                                                ...prev,
                                                                                                [productKey]: {
                                                                                                        ...(prev[productKey] || {}),
                                                                                                        comment: e.target.value,
                                                                                                },
                                                                                        }))
                                                                        }
									/>
                                                                                <ImagePicker
                                                                                        name={item.productName}
                                                                                        files={state.files || []}
                                                                                        onAdd={(files) => handleFilesAdd(productKey, files)}
                                                                                        onRemove={(idx) => handleFilesRemove(productKey, idx)}
                                                                        />
                                                                </CardContent>
                                                        </Card>
                                                </motion.div>
                                        })
                                )}
                        </div>

                        <div className="mt-8 flex items-center justify-end gap-3">
				<Button variant="outline" onClick={() => router.back()}>
					Cancel
				</Button>
				<Button disabled={!allValid || submitting} onClick={submitReviews}>
					{submitting ? "Submitting..." : "Submit Reviews"}
				</Button>
			</div>
		</div>
	);
}
