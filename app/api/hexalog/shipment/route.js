import { createHexalogShipment } from "@/lib/hexalog.js";

export async function PUT(req) {
	try {
		const shipmentPayload = await req.json();
		if (!shipmentPayload) {
			return Response.json(
				{ success: false, message: "shipment payload is required" },
				{ status: 400 }
			);
		}
		const data = await createHexalogShipment(shipmentPayload);
		return Response.json({ success: true, data });
	} catch (error) {
		return Response.json(
			{ success: false, message: error.message || "Failed to create shipment" },
			{ status: 500 }
		);
	}
}
