import { companyInfo } from "@/constants/companyInfo.js";
import { generateInvoicePDF } from "@/lib/invoicePDF.js";
import { sendMail } from "@/lib/mail.js";
import { buildGstLineItems, calculateGstTotals, determineGstMode, GST_RATE_PERCENT } from "@/lib/utils/gst.js";

const formatCurrency = (value) =>
        `₹${Number(value || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
        })}`;

function toPlainOrder(order) {
        if (order && typeof order.toObject === "function") {
                return order.toObject();
        }
        return order || {};
}

function extractProducts(order) {
        if (Array.isArray(order?.products) && order.products.length > 0) {
                        return order.products.map((item) => ({
                                productId: item.productId?._id || item.productId,
                                productName:
                                        item.productName ||
                                        item.name ||
                                        item.title ||
                                        item.productId?.title ||
                                        "Unknown Product",
                                quantity: item.quantity || 0,
                                price: Number(item.price ?? item.unitPrice ?? 0),
                                totalPrice:
                                        Number(
                                                item.totalPrice ??
                                                        Number(item.price ?? item.unitPrice ?? 0) *
                                                                Number(item.quantity || 0)
                                        ),
                        }));
        }

        if (!Array.isArray(order?.subOrders)) {
                return [];
        }

        return order.subOrders.flatMap((subOrder) => {
                if (!Array.isArray(subOrder?.products)) {
                        return [];
                }

                return subOrder.products.map((product) => ({
                        productId: product.productId?._id || product.productId,
                        productName:
                                product.productName ||
                                product.productId?.title ||
                                product.productId?.name ||
                                "Unknown Product",
                        quantity: product.quantity || 0,
                        price: Number(product.price ?? product.productId?.price ?? 0),
                        totalPrice:
                                Number(
                                        product.totalPrice ??
                                                Number(product.price ?? product.productId?.price ?? 0) *
                                                        Number(product.quantity || 0)
                                ),
                }));
        });
}

export function normalizeOrderForEmail(order) {
        const plainOrder = toPlainOrder(order);
        const products = extractProducts(plainOrder);

        const sanitizeAmount = (value, fallback = 0) => {
                const numeric = Number(value);
                return Number.isFinite(numeric) ? numeric : fallback;
        };

        const subtotalValue = sanitizeAmount(plainOrder.subtotal);
        const discountValue = sanitizeAmount(plainOrder.discount);
        const shippingCostValue = sanitizeAmount(plainOrder.shippingCost);
        const address = plainOrder.deliveryAddress || {};
        const existingGst =
                plainOrder && typeof plainOrder.gst === "object" ? plainOrder.gst : {};

        const gstMode = existingGst.mode || determineGstMode(address);
        const gstRate = Number.isFinite(Number(existingGst.rate))
                ? Number(existingGst.rate)
                : GST_RATE_PERCENT;

        const totals = calculateGstTotals({
                subtotal: subtotalValue,
                discount: discountValue,
                shippingCost: shippingCostValue,
                address,
                gstMode,
                gstRatePercent: gstRate,
        });

        const sanitizedGst = {
                mode: gstMode,
                rate: gstRate,
                cgst: sanitizeAmount(existingGst.cgst, totals.gst.cgst),
                sgst: sanitizeAmount(existingGst.sgst, totals.gst.sgst),
                igst: sanitizeAmount(existingGst.igst, totals.gst.igst),
                total: sanitizeAmount(existingGst.total, totals.gst.total),
                taxableAmount: sanitizeAmount(
                        existingGst.taxableAmount,
                        totals.gst.taxableAmount
                ),
        };

        if (!sanitizedGst.total) {
                const summed = sanitizedGst.cgst + sanitizedGst.sgst + sanitizedGst.igst;
                sanitizedGst.total = sanitizeAmount(summed, totals.gst.total);
        }

        return {
                ...plainOrder,
                orderNumber: plainOrder.orderNumber,
                orderDate: plainOrder.orderDate || plainOrder.createdAt || new Date(),
                subtotal: totals.subtotal,
                tax: sanitizedGst.total,
                shippingCost: totals.shippingCost,
                discount: totals.discount,
                totalAmount: sanitizeAmount(plainOrder.totalAmount, totals.total),
                gst: sanitizedGst,
                taxableAmount: sanitizedGst.taxableAmount,
                customerName: plainOrder.customerName,
                customerEmail: plainOrder.customerEmail,
                customerMobile: plainOrder.customerMobile,
                paymentMethod: plainOrder.paymentMethod,
                paymentStatus: plainOrder.paymentStatus,
                deliveryAddress:
                        plainOrder.deliveryAddress ||
                        plainOrder.shipToAddress ||
                        {},
                products,
        };
}

function buildOrderItemsHtml(products) {
        if (!Array.isArray(products) || products.length === 0) {
                return `<tr><td colspan="3" style="padding:8px;border:1px solid #e5e7eb;text-align:center;">No items found</td></tr>`;
        }

        return products
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
}

function buildOrderSummaryHtml(order) {
        const productsHtml = buildOrderItemsHtml(order.products);
        const address = order.deliveryAddress || {};
        const gstLines = buildGstLineItems(order.gst);

        const gstRowsHtml = gstLines
                .map(
                        (item) => `
                        <tr>
                                <td style="text-align:right;padding:4px;">${item.label}</td>
                                <td style="text-align:right;padding:4px;">${formatCurrency(
                                        item.amount
                                )}</td>
                        </tr>`
                )
                .join("");

        const gstModeMessage =
                order?.gst?.mode === "cgst_sgst"
                        ? "CGST & SGST applied for Bengaluru delivery"
                        : order?.gst?.mode === "igst"
                          ? "IGST applied for this delivery"
                          : "";

        return `
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
                                ${productsHtml}
                        </tbody>
                </table>

                <table style="width:100%;margin-top:8px;">
                        <tr>
                                <td style="text-align:right;padding:4px;">Subtotal:</td>
                                <td style="text-align:right;padding:4px;">${formatCurrency(order.subtotal)}</td>
                        </tr>
                        ${gstRowsHtml}
                        ${order.shippingCost > 0 ? `<tr><td style="text-align:right;padding:4px;">Shipping:</td><td style="text-align:right;padding:4px;">${formatCurrency(order.shippingCost)}</td></tr>` : ""}
                        ${order.discount > 0 ? `<tr><td style="text-align:right;padding:4px;">Discount:</td><td style="text-align:right;padding:4px;">-${formatCurrency(order.discount)}</td></tr>` : ""}
                        <tr>
                                <td style="text-align:right;padding:4px;font-weight:bold;">Total:</td>
                                <td style="text-align:right;padding:4px;font-weight:bold;">${formatCurrency(order.totalAmount)}</td>
                        </tr>
                </table>

                <h3 style="margin-top:24px;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">Shipping Address</h3>
                <p style="margin:0;">${address.name || ""}</p>
                <p style="margin:0;">${address.street || ""}</p>
                <p style="margin:0;">${[address.city, address.state].filter(Boolean).join(", ")} ${
                address.zipCode ? "- " + address.zipCode : ""
        }</p>
                <p style="margin:0;">${address.country || ""}</p>
                ${
                        gstModeMessage
                                ? `<p style="margin-top:12px;color:#4b5563;font-size:12px;">${gstModeMessage}</p>`
                                : ""
                }
        `;
}

export async function sendOrderConfirmationEmail({
        order,
        to,
        cc,
        pdfBase64,
        attachInvoice = false,
} = {}) {
        const normalizedOrder = normalizeOrderForEmail(order);

        const recipients = Array.isArray(to)
                ? to.filter(Boolean)
                : to
                ? [to]
                : [];

        if (recipients.length === 0 && normalizedOrder.customerEmail) {
                recipients.push(normalizedOrder.customerEmail);
        }

        if (recipients.length === 0) {
                throw new Error("No recipient email address available for confirmation email");
        }

        const formattedDate = new Date(normalizedOrder.orderDate).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
        });

        const html = `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333;">
                        <h2 style="color:#4f46e5;">Thank you for your order!</h2>
                        <p>Hi ${normalizedOrder.customerName || "Customer"},</p>
                        <p>Your order <strong>${normalizedOrder.orderNumber}</strong> has been placed successfully on ${formattedDate}.</p>

                        ${buildOrderSummaryHtml(normalizedOrder)}

                        <p style="margin-top:24px;">Your invoice is attached as a PDF for your records.</p>
                        <p>If you have any questions, reply to this email or contact us at ${companyInfo.email}.</p>
                        <p style="margin-top:16px;">Best regards,<br/>${
                                companyInfo.name || companyInfo.companyName || "Team"
                        }</p>
                </div>
        `;

        const attachments = [];
        let pdfError = null;

        if (pdfBase64) {
                try {
                        const pdfBuffer = Buffer.from(pdfBase64, "base64");
                        attachments.push({
                                filename: `invoice-${normalizedOrder.orderNumber}.pdf`,
                                content: pdfBuffer,
                                contentType: "application/pdf",
                        });
                } catch (error) {
                        pdfError = error.message;
                }
        } else if (attachInvoice) {
                try {
                        const invoiceBuffer = await generateInvoicePDF(normalizedOrder);
                        if (invoiceBuffer) {
                                attachments.push({
                                        filename: `invoice-${normalizedOrder.orderNumber}.pdf`,
                                        content: invoiceBuffer,
                                        contentType: "application/pdf",
                                });
                        }
                } catch (error) {
                        pdfError = error.message;
                }
        }

        await sendMail({
                to: recipients,
                cc,
                subject: `Order Confirmed - ${normalizedOrder.orderNumber}`,
                html,
                attachments: attachments.length > 0 ? attachments : undefined,
        });

        return {
                emailSent: true,
                pdfAttached: attachments.length > 0,
                pdfError,
        };
}

export async function sendOrderFailureEmail({ order, to, cc, failureReason } = {}) {
        const normalizedOrder = normalizeOrderForEmail(order);

        const recipients = Array.isArray(to)
                ? to.filter(Boolean)
                : to
                ? [to]
                : [];

        if (recipients.length === 0 && normalizedOrder.customerEmail) {
                recipients.push(normalizedOrder.customerEmail);
        }

        if (recipients.length === 0) {
                throw new Error("No recipient email address available for failure notification");
        }

        const productsHtml = buildOrderItemsHtml(normalizedOrder.products);

        const html = `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333;">
                        <h2 style="color:#dc2626;">We couldn't process your payment</h2>
                        <p>Hi ${normalizedOrder.customerName || "Customer"},</p>
                        <p>We attempted to process your payment for order <strong>${normalizedOrder.orderNumber || "(pending)"}</strong>, but it did not complete successfully.</p>
                        ${failureReason ? `<p><strong>Reason:</strong> ${failureReason}</p>` : ""}

                        <h3 style="margin-top:24px;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">Items in your cart</h3>
                        <table style="width:100%;border-collapse:collapse;">
                                <thead>
                                        <tr style="background:#f3f4f6;">
                                                <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Product</th>
                                                <th style="padding:8px;border:1px solid #e5e7eb;text-align:center;">Qty</th>
                                                <th style="padding:8px;border:1px solid #e5e7eb;text-align:right;">Total</th>
                                        </tr>
                                </thead>
                                <tbody>
                                        ${productsHtml}
                                </tbody>
                        </table>

                        <p style="margin-top:24px;">No payment has been captured for this order. You can try placing the order again from your cart.</p>
                        <p>If you continue to face issues, please contact us at ${companyInfo.email}.</p>
                        <p style="margin-top:16px;">Best regards,<br/>${
                                companyInfo.name || companyInfo.companyName || "Team"
                        }</p>
                </div>
        `;

        await sendMail({
                to: recipients,
                cc,
                subject: `Payment Failed - ${normalizedOrder.orderNumber || "Order Attempt"}`,
                html,
        });

        return { emailSent: true };
}

export async function sendOrderCancellationEmail({
        order,
        subOrder,
        to,
        cc,
        cancelledBy,
        reason,
} = {}) {
        const normalizedOrder = normalizeOrderForEmail(order);

        const recipients = Array.isArray(to)
                ? to.filter(Boolean)
                : to
                ? [to]
                : [];

        if (recipients.length === 0 && normalizedOrder.customerEmail) {
                recipients.push(normalizedOrder.customerEmail);
        }

        if (recipients.length === 0) {
                throw new Error("No recipient email address available for cancellation notice");
        }

        const cancellationActor =
                cancelledBy === "seller"
                        ? "the seller"
                        : cancelledBy === "admin"
                          ? "our support team"
                          : "our team";

        const plainSubOrder =
                subOrder && typeof subOrder.toObject === "function"
                        ? subOrder.toObject()
                        : subOrder || null;

        const sellerName =
                plainSubOrder?.sellerId?.businessName ||
                plainSubOrder?.sellerId?.name ||
                null;

        const cancelledSection = plainSubOrder
                ? `the shipment handled by ${
                          sellerName ? `<strong>${sellerName}</strong>` : "one of your sellers"
                  }`
                : "your order";

        const cancelledProducts = Array.isArray(plainSubOrder?.products)
                ? plainSubOrder.products.map((item) => ({
                          productName:
                                  item.productName ||
                                  item.productId?.title ||
                                  item.productId?.name ||
                                  "Product",
                          quantity: item.quantity || 0,
                          totalPrice: Number(
                                  item.totalPrice ??
                                          (Number.isFinite(Number(item.price))
                                                  ? Number(item.price) * Number(item.quantity || 0)
                                                  : 0)
                          ),
                  }))
                : normalizedOrder.products;

        const productsHtml = buildOrderItemsHtml(cancelledProducts);

        const reasonHtml = reason
                ? `<p style="margin-top:16px;"><strong>Reason provided:</strong> ${reason}</p>`
                : "";

        const orderStatusMessage =
                order?.status === "cancelled"
                        ? "The entire order has been cancelled and any pending payments will be reversed as per our policy."
                        : "The remaining items in your order will continue to be processed normally.";

        const html = `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333;">
                        <h2 style="color:#dc2626;">Update on your order</h2>
                        <p>Hi ${normalizedOrder.customerName || "Customer"},</p>
                        <p>We wanted to let you know that ${cancelledSection} for order <strong>${
                                normalizedOrder.orderNumber || ""
                        }</strong> was cancelled by ${cancellationActor}.</p>
                        ${reasonHtml}
                        <p style="margin-top:16px;">The following items are affected:</p>
                        <table style="width:100%;border-collapse:collapse;">
                                <thead>
                                        <tr style="background:#f3f4f6;">
                                                <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Product</th>
                                                <th style="padding:8px;border:1px solid #e5e7eb;text-align:center;">Qty</th>
                                                <th style="padding:8px;border:1px solid #e5e7eb;text-align:right;">Total</th>
                                        </tr>
                                </thead>
                                <tbody>
                                        ${productsHtml}
                                </tbody>
                        </table>
                        <p style="margin-top:16px;">${orderStatusMessage}</p>
                        <p>If you have any questions or need support, reply to this email or reach us at ${
                                companyInfo.email
                        }.</p>
                        <p style="margin-top:16px;">Best regards,<br/>${
                                companyInfo.name || companyInfo.companyName || "Team"
                        }</p>
                </div>
        `;

        await sendMail({
                to: recipients,
                cc,
                subject: `Order Update - ${normalizedOrder.orderNumber || "Shipment Cancelled"}`,
                html,
        });

        return { emailSent: true };
}

export default {
        normalizeOrderForEmail,
        sendOrderConfirmationEmail,
        sendOrderFailureEmail,
        sendOrderCancellationEmail,
};
