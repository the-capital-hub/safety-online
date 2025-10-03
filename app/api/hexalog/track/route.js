import { NextResponse } from "next/server";
import { trackHexalogShipment } from "@/lib/hexalog.js";
import {
	logShipmentTracking,
	logShipmentError,
} from "@/lib/reports/shipmentLogger.js";

export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		const trackingId = searchParams.get("trackingId");

		if (!trackingId) {
			return NextResponse.json(
				{ success: false, message: "trackingId is required" },
				{ status: 400 }
			);
		}

		const trackingData = await trackHexalogShipment(trackingId);

		// Log tracking request (we don't have subOrderId here, so we'll use trackingId)
		logShipmentTracking(trackingId, trackingId, trackingData);

		return NextResponse.json({
			success: true,
			data: trackingData,
		});
	} catch (error) {
		console.error("Tracking API error:", error);

		// Log tracking error
		logShipmentError(
			trackingId || "unknown",
			"tracking_api_error",
			error.message,
			{ trackingId, error: error.stack }
		);

		return NextResponse.json(
			{
				success: false,
				message: error.message || "Failed to track shipment",
			},
			{ status: 500 }
		);
	}
}
