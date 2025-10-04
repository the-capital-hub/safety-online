import dbConnect from "@/lib/dbConnect";
import SubOrder from "@/model/SubOrder";
import { createHmac } from "crypto";

// ✅ Ensure raw body available (needed for HMAC)
export const config = {
	api: {
		bodyParser: false,
	},
};

// 🔹 Utility: read raw request body
async function getRawBody(req) {
	return new Promise((resolve, reject) => {
		let data = "";
		req.on("data", (chunk) => {
			data += chunk;
		});
		req.on("end", () => resolve(data));
		req.on("error", reject);
	});
}

// 🔹 Verify webhook signature
function verifySignature(rawBody, signature, secret) {
	const computed = createHmac("sha256", secret).update(rawBody).digest("hex");
	return computed === signature;
}

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const rawBody = await getRawBody(req);

		const signature = req.headers["x-hexalog-signature"]; // check docs if header differs
		const secret = process.env.HEXALOG_WEBHOOK_SECRET;

		if (!verifySignature(rawBody, signature, secret)) {
			console.error("❌ Invalid webhook signature");
			return res.status(401).json({ error: "Invalid signature" });
		}

		const payload = JSON.parse(rawBody);
		console.log("✅ Verified webhook payload:", payload);

		await dbConnect();

		// ---------------------------
		// 1️⃣ track_updated webhook
		// ---------------------------
		if (payload.status && payload.ctime) {
			const {
				id: trackingId,
				orderNumber,
				status,
				location,
				desc,
				attempts,
				pickupTime,
				ctime,
			} = payload;

			const subOrder = await SubOrder.findById(orderNumber);
			if (!subOrder) {
				return res.status(404).json({ error: "SubOrder not found" });
			}

			const statusMap = {
				Delivered: "delivered",
				"Out for Delivery": "out_for_delivery",
				"In Transit": "in_transit",
				"Picked Up": "picked_up",
				Undelivered: "failed_delivery",
				RTO: "rto",
				Cancelled: "cancelled",
			};
			const mappedStatus = statusMap[status] || "in_transit";

			subOrder.shipmentPackage = {
				...subOrder.shipmentPackage,
				trackingId,
				status: mappedStatus,
				currentLocation: location || subOrder.shipmentPackage?.currentLocation,
				deliveryNotes: desc,
				deliveryAttempts: Number(attempts || 0),
				pickedUpAt: pickupTime
					? new Date(pickupTime)
					: subOrder.shipmentPackage?.pickedUpAt,
				deliveredAt:
					status === "Delivered"
						? new Date(ctime)
						: subOrder.shipmentPackage?.deliveredAt,
			};

			if (mappedStatus === "delivered") {
				subOrder.status = "delivered";
				subOrder.actualDelivery = new Date(ctime);
			} else if (
				["shipped", "in_transit", "out_for_delivery"].includes(mappedStatus)
			) {
				subOrder.status = "shipped";
			}

			await subOrder.save();
			return res.status(200).json({ message: "track_updated processed" });
		}

		// ---------------------------
		// 2️⃣ shipment_created / shipment_recreated
		// ---------------------------
		if (payload.vendor && payload.wbn && payload.channelId) {
			const { id: trackingId, wbn, vendor, orderNumber, channelId } = payload;

			const subOrder = await SubOrder.findById(orderNumber);
			if (!subOrder) {
				return res.status(404).json({ error: "SubOrder not found" });
			}

			subOrder.shipmentPackage = {
				...subOrder.shipmentPackage,
				trackingId,
				courierPartner: vendor,
				barcodes: { waybill: wbn },
				status: "order_placed",
				shipmentCreatedAt: new Date(),
			};

			subOrder.status = "confirmed"; // mark order as confirmed on shipment creation

			await subOrder.save();
			return res
				.status(200)
				.json({ message: "shipment_created / shipment_recreated processed" });
		}

		return res.status(400).json({ error: "Unknown webhook payload" });
	} catch (err) {
		console.error("❌ Webhook error:", err);
		return res.status(500).json({ error: "Internal server error" });
	}
}
