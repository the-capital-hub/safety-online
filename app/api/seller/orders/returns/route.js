import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { dbConnect } from "@/lib/dbConnect";
import SubOrder from "@/model/SubOrder";

const formatAddress = (address) => {
	if (!address) return "";
	const parts = [
		address.street,
		address.city,
		address.state,
		address.zipCode,
		address.country,
	].filter(Boolean);
	return parts.join(", ");
};

export async function GET() {
	try {
		await dbConnect();

		const cookieStore = cookies();
		const token = cookieStore.get("seller-auth-token")?.value;

		if (!token) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		if (!process.env.JWT_SECRET) {
			return NextResponse.json(
				{ success: false, message: "Server configuration error" },
				{ status: 500 }
			);
		}

		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET);
		} catch (error) {
			return NextResponse.json(
				{ success: false, message: "Invalid token" },
				{ status: 401 }
			);
		}

		const sellerId = decoded.userId || decoded.id;
		if (!sellerId) {
			return NextResponse.json(
				{ success: false, message: "Invalid token payload" },
				{ status: 401 }
			);
		}

		const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

		const subOrders = await SubOrder.find({
			sellerId: sellerObjectId,
			status: "returned",
		})
			.populate({
				path: "orderId",
				select:
					"orderNumber orderDate deliveryAddress customerName customerEmail customerMobile",
			})
			.lean();

		const orders = subOrders.map((subOrder) => {
			const totalQuantity = (subOrder.products || []).reduce(
				(sum, item) => sum + (item.quantity || 0),
				0
			);
			const primaryProduct = subOrder.products?.[0];

			const refundDeadline = subOrder.updatedAt
				? new Date(
						new Date(subOrder.updatedAt).getTime() + 7 * 24 * 60 * 60 * 1000
				  )
				: null;

			return {
				id: subOrder._id.toString(),
				orderNumber: subOrder.orderId?.orderNumber || "N/A",
				subOrderCode: `${subOrder.orderId?.orderNumber || "SUB"}-${subOrder._id
					.toString()
					.slice(-4)}`,
				orderDate: subOrder.orderId?.orderDate,
				status: subOrder.status,
				totalAmount: Number(subOrder.totalAmount || 0),
				subtotal: Number(subOrder.subtotal || 0),
				discount: Number(subOrder.discount || 0),
				shippingCost: Number(subOrder.shippingCost || 0),
				totalQuantity,
				refundDeadline,
				updatedAt: subOrder.updatedAt,
				products: (subOrder.products || []).map((product) => ({
					id: product.productId?.toString(),
					name: product.productName,
					image: product.productImage,
					quantity: product.quantity,
					price: product.price,
					totalPrice: product.totalPrice,
				})),
				deliveryAddress: subOrder.orderId?.deliveryAddress,
				location: formatAddress(subOrder.orderId?.deliveryAddress),
				customer: {
					name:
						subOrder.orderId?.customerName ||
						subOrder.orderId?.customerEmail ||
						"Customer",
					email: subOrder.orderId?.customerEmail,
					mobile: subOrder.orderId?.customerMobile,
				},
			};
		});

		return NextResponse.json({ success: true, orders });
	} catch (error) {
		console.error("Seller return orders error:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to fetch return orders" },
			{ status: 500 }
		);
	}
}
