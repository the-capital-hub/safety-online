import { companyInfo } from "@/constants/companyInfo.js";
import { generateInvoicePDF } from "@/lib/invoicePDF.js";
import { sendMail } from "@/lib/mail.js";

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

        return {
                ...plainOrder,
                orderNumber: plainOrder.orderNumber,
                orderDate: plainOrder.orderDate || plainOrder.createdAt || new Date(),
                subtotal: Number(plainOrder.subtotal || 0),
                tax: Number(plainOrder.tax || 0),
                shippingCost: Number(plainOrder.shippingCost || 0),
                discount: Number(plainOrder.discount || 0),
                totalAmount: Number(plainOrder.totalAmount || 0),
                customerName: plainOrder.customerName,
                customerEmail: plainOrder.customerEmail,
                customerMobile: plainOrder.customerMobile,
                paymentMethod: plainOrder.paymentMethod,
                paymentStatus: plainOrder.paymentStatus,
                deliveryAddress:
                        plainOrder.deliveryAddress ||
                        plainOrder.shipToAddress ||
                        plainOrder.billToAddress ||
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
                        ${order.tax > 0 ? `<tr><td style="text-align:right;padding:4px;">Tax:</td><td style="text-align:right;padding:4px;">${formatCurrency(order.tax)}</td></tr>` : ""}
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

export default {
        normalizeOrderForEmail,
        sendOrderConfirmationEmail,
        sendOrderFailureEmail,
};
