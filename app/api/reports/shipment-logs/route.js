import { NextResponse } from "next/server";
import {
	getAllShipmentLogs,
	getShipmentLogs,
} from "@/lib/reports/shipmentLogger.js";

export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		const subOrderId = searchParams.get("subOrderId");
		const action = searchParams.get("action");
		const status = searchParams.get("status");
		const dateFrom = searchParams.get("dateFrom");
		const dateTo = searchParams.get("dateTo");

		let logs;

		if (subOrderId) {
			// Get logs for specific subOrder
			logs = getShipmentLogs(subOrderId);
		} else {
			// Get all logs with optional filters
			const filters = {};
			if (action) filters.action = action;
			if (status) filters.status = status;
			if (dateFrom) filters.dateFrom = dateFrom;
			if (dateTo) filters.dateTo = dateTo;

			logs = getAllShipmentLogs(filters);
		}

		return NextResponse.json({
			success: true,
			logs,
			count: logs.length,
		});
	} catch (error) {
		console.error("Shipment logs API error:", error);
		return NextResponse.json(
			{
				success: false,
				message: error.message || "Failed to fetch shipment logs",
			},
			{ status: 500 }
		);
	}
}
