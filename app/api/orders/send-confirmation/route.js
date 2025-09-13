// /app/api/orders/send-confirmation/route.js
import { NextResponse } from "next/server";
import User from "@/model/User";
import { dbConnect } from "@/lib/dbConnect.js";
import { sendMail } from "@/lib/mail";
import { companyInfo } from "@/constants/companyInfo.js";

export async function POST(req) {
	try {
		await dbConnect();

		const body = await req.json();
		const { orderData, userId, pdfBase64 } = body; // Added pdfBase64 parameter

		// console.log("orderData from send-confirmation:", orderData);

		if (!orderData || !userId) {
			return NextResponse.json(
				{ success: false, error: "Order data and user ID are required" },
				{ status: 400 }
			);
		}

		// Get user information
		const user = await User.findById(userId).select(
			"email firstName notificationPreferences"
		);

		if (!user) {
			return NextResponse.json(
				{ success: false, error: "User not found" },
				{ status: 404 }
			);
		}

		// Check if user has opted out of email notifications
		const prefs = user?.notificationPreferences;
		const emailOptOut =
			prefs?.channels?.email === false ||
			prefs?.settings?.["order-placed"]?.email === false;

		if (emailOptOut) {
			return NextResponse.json({
				success: true,
				message: "User opted out of email notifications",
				emailSent: false,
			});
		}

		// Format currency helper
		const formatCurrency = (value) =>
			`₹${value.toLocaleString("en-IN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			})}`;

		// Generate items HTML for email
		const itemsHtml = orderData.products
			.map(
				(item) => `
				<tr>
					<td style="padding:8px;border:1px solid #e5e7eb;">${item.productName}</td>
					<td style="padding:8px;border:1px solid #e5e7eb;text-align:center;">${
						item.quantity
					}</td>
					<td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">${formatCurrency(
						item.totalPrice
					)}</td>
				</tr>`
			)
			.join("");

		// Get shipping address
		const address = orderData.deliveryAddress;
		// orderData.shipToAddress ||
		// orderData.billToAddress ||

		// Generate email HTML
		const html = `
			<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333;">
				<h2 style="color:#4f46e5;">Thank you for your order!</h2>
				<p>Hi ${user.firstName},</p>
				<p>Your order <strong>${
					orderData.orderNumber
				}</strong> has been placed successfully on ${new Date(
			orderData.orderDate
		).toLocaleDateString()}.</p>
				
				<h3 style="margin-top:24px;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">Order Summary</h3>
				<table style="width:100%;border-collapse:collapse;">
					<thead>
						<tr style="background:#f3f4f6;">
							<th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Product</th>
							<th style="padding:8px;border:1px solid #e5e7eb;text-align:center;">Qty</th>
							<th style="padding:8px;border:1px solid #e5e7eb;text-align:right;">Total</th>
						</tr>
					</thead>
					<tbody>
						${itemsHtml}
					</tbody>
				</table>
				
				<table style="width:100%;margin-top:8px;">
					<tr>
						<td style="text-align:right;padding:4px;">Subtotal:</td>
						<td style="text-align:right;padding:4px;">${formatCurrency(
							orderData.subtotal
						)}</td>
					</tr>
					${
						orderData.gst &&
						orderData.gst.cgst + orderData.gst.sgst + orderData.gst.igst > 0
							? `<tr><td style="text-align:right;padding:4px;">GST:</td><td style="text-align:right;padding:4px;">${formatCurrency(
									orderData.gst.cgst + orderData.gst.sgst + orderData.gst.igst
							  )}</td></tr>`
							: ""
					}
					${
						orderData.shippingCost > 0
							? `<tr><td style="text-align:right;padding:4px;">Shipping:</td><td style="text-align:right;padding:4px;">${formatCurrency(
									orderData.shippingCost
							  )}</td></tr>`
							: ""
					}
					${
						orderData.discount > 0
							? `<tr><td style="text-align:right;padding:4px;">Discount:</td><td style="text-align:right;padding:4px;">-${formatCurrency(
									orderData.discount
							  )}</td></tr>`
							: ""
					}
					<tr>
						<td style="text-align:right;padding:4px;font-weight:bold;">Total:</td>
						<td style="text-align:right;padding:4px;font-weight:bold;">${formatCurrency(
							orderData.totalAmount
						)}</td>
					</tr>
				</table>
				
				<h3 style="margin-top:24px;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">Shipping Address</h3>
				<p style="margin:0;">${address.name || ""}</p>
				<p style="margin:0;">${address.street || ""}</p>
				<p style="margin:0;">${address.city || ""}, ${address.state || ""} - ${
			address.zipCode || ""
		}</p>
				<p style="margin:0;">${address.country || ""}</p>
				
				<p style="margin-top:24px;">Your invoice is attached as a PDF for your records.</p>
				<p>If you have any questions, reply to this email or contact us at ${
					companyInfo.email
				}.</p>
				<p style="margin-top:16px;">Best regards,<br/>${
					companyInfo.name || companyInfo.companyName || "Team"
				}</p>
			</div>
		`;

		// Prepare attachments with client-generated PDF
		const attachments = [];
		let pdfError = null;

		if (pdfBase64) {
			try {
				// Convert base64 to buffer
				const pdfBuffer = Buffer.from(pdfBase64, "base64");
				attachments.push({
					filename: `invoice-${orderData.orderNumber}.pdf`,
					content: pdfBuffer,
					contentType: "application/pdf",
				});
			} catch (error) {
				console.error("Failed to process client-generated PDF:", error);
				pdfError = error.message;
			}
		} else {
			pdfError = "No PDF provided by client";
		}

		// Send email
		try {
			await sendMail({
				to: [user.email],
				cc: companyInfo.adminEmail ? [companyInfo.adminEmail] : undefined,
				subject: `Order Confirmed - ${orderData.orderNumber}`,
				html,
				attachments: attachments.length > 0 ? attachments : undefined,
			});

			return NextResponse.json({
				success: true,
				message: "Order confirmation email sent successfully",
				emailSent: true,
				pdfAttached: attachments.length > 0,
				pdfError: pdfError,
			});
		} catch (mailError) {
			console.error("Failed to send order confirmation email:", mailError);
			return NextResponse.json(
				{
					success: false,
					error: "Failed to send email",
					details: mailError.message,
					pdfError: pdfError,
				},
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error("Email confirmation error:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
