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
};

const statusColors = {
	pending: "bg-yellow-100 text-yellow-800",
	label_generated: "bg-blue-100 text-blue-800",
	picked_up: "bg-purple-100 text-purple-800",
	in_transit: "bg-indigo-100 text-indigo-800",
	out_for_delivery: "bg-orange-100 text-orange-800",
	delivered: "bg-green-100 text-green-800",
	failed_delivery: "bg-red-100 text-red-800",
	rto: "bg-red-100 text-red-800",
	cancelled: "bg-gray-100 text-gray-800",
};

const formatDate = (dateString) => {
	if (!dateString) return "N/A";
	return new Date(dateString).toLocaleString("en-IN", {
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
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/hexalog/track?trackingId=${shipmentPackage.trackingId}`
			);
			const result = await response.json();

			if (result.success) {
				setTrackingData(result.data);
			} else {
				setError(result.message || "Failed to fetch tracking data");
			}
		} catch (err) {
			console.error("Tracking fetch error:", err);
			setError("Failed to fetch tracking data");
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
		return statusColors[status] || "bg-gray-100 text-gray-800";
	};

	if (!subOrder) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Truck className="h-5 w-5" />
						Track Shipment - {subOrder._id.slice(-8)}
					</DialogTitle>
					<DialogDescription>
						Track your package delivery status and location
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
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
								<div>
									<label className="text-sm font-medium text-gray-600">
										Package Weight
									</label>
									<p className="text-sm">
										{shipmentPackage?.packageDetails?.actualWeight}g
									</p>
								</div>
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
							</div>
						</CardContent>
					</Card>

					{/* Current Status */}
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
							<div className="flex items-center gap-3">
								{getStatusIcon(shipmentPackage?.status)}
								<Badge className={getStatusColor(shipmentPackage?.status)}>
									{shipmentPackage?.status?.replace("_", " ").toUpperCase() ||
										"UNKNOWN"}
								</Badge>
								<span className="text-sm text-gray-600">
									{formatDate(shipmentPackage?.shipmentCreatedAt)}
								</span>
							</div>
						</CardContent>
					</Card>

					{/* Delivery Address */}
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
									{shipmentPackage?.deliveryAddress?.street}
								</p>
								<p className="text-sm text-gray-600">
									{shipmentPackage?.deliveryAddress?.city},{" "}
									{shipmentPackage?.deliveryAddress?.state} -{" "}
									{shipmentPackage?.deliveryAddress?.zipCode}
								</p>
								<p className="text-sm text-gray-600">
									{shipmentPackage?.deliveryAddress?.country}
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Tracking Timeline */}
					{loading && (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-8 w-8 animate-spin" />
							<span className="ml-2">Fetching tracking data...</span>
						</div>
					)}

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

					{trackingData && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Tracking Timeline</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{trackingData.timeline?.map((event, index) => (
										<motion.div
											key={index}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.1 }}
											className="flex items-start gap-3"
										>
											<div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
												{getStatusIcon(event.status)}
											</div>
											<div className="flex-1">
												<p className="font-medium">{event.description}</p>
												<p className="text-sm text-gray-600">
													{formatDate(event.timestamp)}
												</p>
												{event.location && (
													<p className="text-sm text-gray-500">
														📍 {event.location}
													</p>
												)}
											</div>
										</motion.div>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Actions */}
					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							Close
						</Button>
						{shipmentPackage?.hexalogShipmentId && (
							<Button
								onClick={() => {
									const trackingUrl = `https://api.hexalog.in/api/v1/track/${shipmentPackage.trackingId}`;
									window.open(trackingUrl, "_blank");
								}}
							>
								View on Hexalog
							</Button>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
