"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Loader2,
	Truck,
	Package,
	MapPin,
	Clock,
	CheckCircle,
	AlertCircle,
	RefreshCw,
	Calendar,
	Hash,
	Info,
} from "lucide-react";
import { toast } from "react-hot-toast";

const statusIcons = {
	pending: Clock,
	label_generated: Package,
	picked_up: Truck,
	in_transit: Truck,
	out_for_delivery: Truck,
	delivered: CheckCircle,
	failed_delivery: AlertCircle,
	rto: AlertCircle,
	cancelled: AlertCircle,
	"Order Placed": Package,
	Cancelled: AlertCircle,
	"In Transit": Truck,
	"Out for Delivery": Truck,
	Delivered: CheckCircle,
};

const statusColors = {
	pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
	label_generated: "bg-blue-100 text-blue-800 border-blue-200",
	picked_up: "bg-purple-100 text-purple-800 border-purple-200",
	in_transit: "bg-indigo-100 text-indigo-800 border-indigo-200",
	out_for_delivery: "bg-orange-100 text-orange-800 border-orange-200",
	delivered: "bg-green-100 text-green-800 border-green-200",
	failed_delivery: "bg-red-100 text-red-800 border-red-200",
	rto: "bg-red-100 text-red-800 border-red-200",
	cancelled: "bg-gray-100 text-gray-800 border-gray-200",
	"Order Placed": "bg-blue-100 text-blue-800 border-blue-200",
	Cancelled: "bg-red-100 text-red-800 border-red-200",
	"In Transit": "bg-indigo-100 text-indigo-800 border-indigo-200",
	"Out for Delivery": "bg-orange-100 text-orange-800 border-orange-200",
	Delivered: "bg-green-100 text-green-800 border-green-200",
};

const formatDate = (timestamp) => {
	if (!timestamp) return "N/A";
	// Handle both milliseconds and seconds timestamps
	const date =
		timestamp > 10000000000 ? new Date(timestamp) : new Date(timestamp * 1000);
	return date.toLocaleString("en-IN", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

export function TrackingModal({ open, onOpenChange, subOrder }) {
	const [trackingData, setTrackingData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const shipmentPackage = subOrder?.shipmentPackage;

	useEffect(() => {
		if (open && shipmentPackage?.trackingId) {
			fetchTrackingData();
		}
	}, [open, shipmentPackage?.trackingId]);

	const fetchTrackingData = async () => {
		if (!shipmentPackage?.trackingId) {
			setError("No tracking ID available");
			toast.error("No tracking ID available for this shipment");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/hexalog/track?trackingId=${shipmentPackage.trackingId}`
			);
			const result = await response.json();
			console.log("Tracking fetch result:", result);
			toast.success("Tracking data fetched successfully");

			if (result.success) {
				// Store the entire response data
				setTrackingData(result.data);
			} else {
				setError(result.message || "Failed to fetch tracking data");
			}
		} catch (err) {
			console.error("Tracking fetch error:", err);
			setError("Failed to fetch tracking data");
			toast.error("Error fetching tracking data");
		} finally {
			setLoading(false);
		}
	};

	const handleRefresh = () => {
		fetchTrackingData();
	};

	const getStatusIcon = (status) => {
		const IconComponent = statusIcons[status] || Clock;
		return <IconComponent className="h-5 w-5" />;
	};

	const getStatusColor = (status) => {
		return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200";
	};

	if (!subOrder) return null;

	const trackInfo = trackingData?.track;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Truck className="h-5 w-5" />
						Track Shipment - {subOrder._id}
					</DialogTitle>
					<DialogDescription>
						Track your package delivery status and location
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Tracking Information */}
					{trackingData && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<Hash className="h-5 w-5" />
									Tracking Information
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="text-sm font-medium text-gray-600">
											Tracking ID
										</label>
										<p className="font-mono text-sm font-semibold">
											{trackingData._id || "Not available"}
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-600">
											Order Number
										</label>
										<p className="font-mono text-sm">
											{trackingData.order_number || "Not available"}
										</p>
									</div>
									{/* Estimated Delivery Date */}
									<div>
										<label className="text-sm font-medium text-gray-600">
											Estimated Delivery Date
										</label>
										<p className="text-sm">
											{trackingData.edd
												? formatDate(trackingData.edd)
												: "Not available - available after pickup"}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Package Information */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Package Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-gray-600">
										Tracking ID
									</label>
									<p className="font-mono text-sm">
										{shipmentPackage?.trackingId || "Not available"}
									</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-600">
										Courier Partner
									</label>
									<p className="text-sm">
										{shipmentPackage?.courierPartner || "Not assigned"}
									</p>
								</div>
								{shipmentPackage?.packageDetails?.actualWeight && (
									<div>
										<label className="text-sm font-medium text-gray-600">
											Package Weight
										</label>
										<p className="text-sm">
											{shipmentPackage?.packageDetails?.actualWeight}g
										</p>
									</div>
								)}
								{shipmentPackage?.packageDetails?.length && (
									<div>
										<label className="text-sm font-medium text-gray-600">
											Package Size
										</label>
										<p className="text-sm">
											{shipmentPackage?.packageDetails?.length} ×{" "}
											{shipmentPackage?.packageDetails?.width} ×{" "}
											{shipmentPackage?.packageDetails?.height} cm
										</p>
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Current Status */}
					{trackInfo && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center justify-between">
									<span>Current Status</span>
									<Button
										variant="outline"
										size="sm"
										onClick={handleRefresh}
										disabled={loading}
									>
										{loading ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<RefreshCw className="h-4 w-4" />
										)}
									</Button>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<div className="flex items-center gap-3 flex-wrap">
										{getStatusIcon(trackInfo.status)}
										<Badge
											className={getStatusColor(trackInfo.status)}
											variant="outline"
										>
											{trackInfo.status?.toUpperCase() || "UNKNOWN"}
										</Badge>
										<span className="text-sm text-gray-600 flex items-center gap-1">
											<Clock className="h-4 w-4" />
											{formatDate(trackInfo.ctime)}
										</span>
									</div>
									{trackInfo.desc && (
										<div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
											<Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
											<p className="text-sm text-gray-700">{trackInfo.desc}</p>
										</div>
									)}
									{trackInfo.location && (
										<p className="text-sm text-gray-600 flex items-center gap-2">
											<MapPin className="h-4 w-4 text-gray-500" />
											<span className="font-medium">Current Location:</span>
											{trackInfo.location}
										</p>
									)}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Delivery Address */}
					{shipmentPackage?.deliveryAddress && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<MapPin className="h-5 w-5" />
									Delivery Address
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<p className="font-medium">
										{shipmentPackage?.deliveryAddress?.name}
									</p>
									<p className="text-sm text-gray-600">
										{shipmentPackage?.deliveryAddress?.address}
									</p>
									<p className="text-sm text-gray-600">
										{shipmentPackage?.deliveryAddress?.city},{" "}
										{shipmentPackage?.deliveryAddress?.state} -{" "}
										{shipmentPackage?.deliveryAddress?.pin}
									</p>
									<p className="text-sm text-gray-600">
										{shipmentPackage?.deliveryAddress?.country}
									</p>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Loading State */}
					{loading && (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-8 w-8 animate-spin text-blue-600" />
							<span className="ml-2 text-gray-600">
								Fetching tracking data...
							</span>
						</div>
					)}

					{/* Error State */}
					{error && (
						<Card>
							<CardContent className="pt-6">
								<div className="flex items-center gap-2 text-red-600">
									<AlertCircle className="h-5 w-5" />
									<span>{error}</span>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={handleRefresh}
									className="mt-2"
								>
									Try Again
								</Button>
							</CardContent>
						</Card>
					)}

					{/* Tracking Timeline */}
					{trackInfo?.details && trackInfo.details.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<Calendar className="h-5 w-5" />
									Tracking Timeline
									<Badge variant="outline" className="ml-2">
										{trackInfo.details.length} events
									</Badge>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-0">
									{trackInfo.details.map((event, index) => (
										<motion.div
											key={index}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.1 }}
											className="relative"
										>
											{/* Timeline connector line */}
											{index !== trackInfo.details.length - 1 && (
												<div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200" />
											)}

											<div className="flex items-start gap-4 pb-6">
												<div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center relative z-10 border-2 border-white shadow-sm">
													{getStatusIcon(event.status)}
												</div>
												<div className="flex-1 pt-0.5">
													<div className="flex items-start justify-between gap-3 flex-wrap">
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2 mb-1">
																<Badge
																	className={getStatusColor(event.status)}
																	variant="outline"
																	size="sm"
																>
																	{event.status}
																</Badge>
																<span className="text-xs text-gray-500 flex items-center gap-1">
																	<Clock className="h-3 w-3" />
																	{formatDate(event.ctime)}
																</span>
															</div>
															{event.desc && (
																<p className="font-medium text-gray-900 text-sm mt-1">
																	{event.desc}
																</p>
															)}
															{event.location && (
																<p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
																	<MapPin className="h-3 w-3" />
																	{event.location}
																</p>
															)}
														</div>
													</div>
												</div>
											</div>
										</motion.div>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Actions */}
					<div className="flex justify-end gap-2 pt-4 border-t">
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							Close
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

