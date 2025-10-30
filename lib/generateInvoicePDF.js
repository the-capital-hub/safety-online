import jsPDF from "jspdf";
import { buildGstLineItems, GST_RATE_PERCENT } from "@/lib/utils/gst.js";

export const generateInvoicePDF = async (order) => {
        try {
                // Create new jsPDF instance
                const doc = new jsPDF();

                const sanitizeNumber = (value) => {
                        const numeric = Number(value);
                        return Number.isFinite(numeric) ? numeric : 0;
                };

                const formatAmount = (value) => sanitizeNumber(value).toFixed(2);
                const formatRate = (value) => {
                        const numeric = Number(value);
                        if (!Number.isFinite(numeric)) {
                                return "0";
                        }
                        const fixed = numeric.toFixed(2);
                        return fixed.replace(/\.00$/, "").replace(/(\.[0-9]*[1-9])0+$/, "$1");
                };

                const billingInfo = order?.billingInfo || {};
                const gstMode = order?.gst?.mode || "igst";
                const gstRate = Number.isFinite(Number(order?.gst?.rate))
                        ? Number(order.gst.rate)
                        : GST_RATE_PERCENT;
                const cgstRate = gstMode === "cgst_sgst" ? gstRate / 2 : 0;
                const sgstRate = gstMode === "cgst_sgst" ? gstRate / 2 : 0;
                const igstRate = gstMode === "igst" ? gstRate : 0;
                const gstLineItems = buildGstLineItems(order?.gst);
                const gstLineLookup = gstLineItems.reduce((acc, item) => {
                        acc[item.key] = item.label;
                        return acc;
                }, {});

                const cgstTotal = sanitizeNumber(order?.gst?.cgst);
                const sgstTotal = sanitizeNumber(order?.gst?.sgst);
                const igstTotal = sanitizeNumber(order?.gst?.igst);
                const taxableBase = sanitizeNumber(
                        order?.gst?.taxableAmount ?? order?.taxableAmount ?? order?.subtotal
                );

                // Set font
                doc.setFont("helvetica");

		// Company Header
		doc.setFontSize(24);
		doc.setTextColor(249, 115, 22); // Orange color
		doc.text("SAFETY ONLINE", 20, 30);

		doc.setFontSize(10);
		doc.setTextColor(102, 102, 102); // Gray color
		doc.text("www.safetyonline.com", 20, 40);
		doc.text("help@safetyonline.com", 20, 45);
		doc.text("+91 7795976568", 20, 50);

		// Invoice Title
		doc.setFontSize(20);
		doc.setTextColor(0, 0, 0); // Black color
		doc.text("INVOICE", 150, 30);

		doc.setFontSize(10);
		doc.setTextColor(102, 102, 102);
		doc.text("Business address", 150, 40);
		doc.text("City, State, Pin - 000 000", 150, 45);
		doc.text("TAX ID 000000000000000", 150, 50);

		// Line separator
		doc.setDrawColor(229, 229, 229);
		doc.line(20, 60, 190, 60);

		// Bill To Section
		doc.setFontSize(12);
		doc.setTextColor(0, 0, 0);
		doc.text("Bill To:", 20, 75);

		doc.setFontSize(10);
		doc.text(order.customerName || "N/A", 20, 85);
		doc.text(order.customerEmail || "N/A", 20, 90);
		doc.text(order.customerMobile || "N/A", 20, 95);

                let billToY = 100;
                if (order.deliveryAddress) {
                        doc.text(order.deliveryAddress.street || "", 20, billToY);
                        billToY += 5;
                        doc.text(
                                `${order.deliveryAddress.city || ""}, ${
                                        order.deliveryAddress.state || ""
                                }`,
                                20,
                                billToY
                        );
                        billToY += 5;
                        doc.text(
                                `${order.deliveryAddress.zipCode || ""}, ${
                                        order.deliveryAddress.country || ""
                                }`,
                                20,
                                billToY
                        );
                        billToY += 5;
                }

                if (billingInfo?.gstInvoiceRequested && billingInfo?.gstNumber) {
                        doc.text(`GSTIN: ${billingInfo.gstNumber}`, 20, billToY);
                        billToY += 5;
                        if (billingInfo.gstLegalName) {
                                doc.text(`Registered Name: ${billingInfo.gstLegalName}`, 20, billToY);
                                billToY += 5;
                        }
                        if (billingInfo.gstTradeName) {
                                doc.text(`Trade Name: ${billingInfo.gstTradeName}`, 20, billToY);
                                billToY += 5;
                        }
                        if (billingInfo.gstAddress) {
                                const addressLines = doc.splitTextToSize(
                                        `GST Registered Address: ${billingInfo.gstAddress}`,
                                        80
                                );
                                doc.text(addressLines, 20, billToY);
                                billToY += addressLines.length * 5;
                        }
                }

		// Invoice Details (Right Side)
		doc.setTextColor(102, 102, 102);
		doc.text("Invoice Number:", 150, 75);
		doc.setTextColor(0, 0, 0);
		doc.text(order.orderNumber || "N/A", 150, 80);

		doc.setTextColor(102, 102, 102);
		doc.text("Order Date:", 150, 90);
		doc.setTextColor(0, 0, 0);
		doc.text(new Date(order.orderDate).toLocaleDateString(), 150, 95);

		doc.setTextColor(102, 102, 102);
		doc.text("Status:", 150, 105);
		doc.setTextColor(0, 0, 0);
		doc.text((order.status || "pending").toUpperCase(), 150, 110);

		// Total Amount (Large)
		doc.setFontSize(18);
		doc.setTextColor(249, 115, 22);
                doc.text(`${formatAmount(order.totalAmount || 0)}`, 150, 125);

		// Payment Information
		doc.setFontSize(10);
		doc.setTextColor(102, 102, 102);
		doc.text("Payment Method:", 20, 135);
		doc.setTextColor(0, 0, 0);
		doc.text(
			(order.paymentMethod || "N/A").replace("_", " ").toUpperCase(),
			70,
			135
		);

		doc.setTextColor(102, 102, 102);
		doc.text("Payment Status:", 150, 135);
		doc.setTextColor(0, 0, 0);
		doc.text((order.paymentStatus || "pending").toUpperCase(), 180, 135);

		// Line separator
		doc.line(20, 145, 190, 145);

		// Products Table Header
		let yPosition = 155;
		doc.setFillColor(243, 244, 246);
		doc.rect(20, yPosition, 170, 8, "F");

		doc.setFontSize(10);
		doc.setTextColor(0, 0, 0);
		doc.text("PRODUCT", 25, yPosition + 5);
		doc.text("QTY", 100, yPosition + 5);
		doc.text("PRICE", 125, yPosition + 5);
		doc.text("TOTAL", 160, yPosition + 5);

		yPosition += 15;

                // Products
                if (order.products && order.products.length > 0) {
                        order.products.forEach((product) => {
                                if (yPosition > 250) {
                                        doc.addPage();
                                        yPosition = 30;
                                }

                                doc.setFontSize(10);
                                doc.setTextColor(0, 0, 0);

                                const productName = (product.productName || "Item").substring(0, 30);
                                const quantity = sanitizeNumber(product.quantity);
                                const unitPrice = sanitizeNumber(product.price);
                                const productTotal = sanitizeNumber(
                                        product.totalPrice || unitPrice * quantity
                                );

                                const share = taxableBase > 0 ? productTotal / taxableBase : 0;
                                const productCgst = share * cgstTotal;
                                const productSgst = share * sgstTotal;
                                const productIgst = share * igstTotal;

                                const taxLines = [];
                                if (gstMode === "igst" && productIgst > 0) {
                                        const label =
                                                gstLineLookup.igst ||
                                                `IGST (${formatRate(igstRate)}%)`;
                                        taxLines.push(`${label}: ₹${formatAmount(productIgst)}`);
                                } else if (gstMode === "cgst_sgst") {
                                        if (productCgst > 0) {
                                                const label =
                                                        gstLineLookup.cgst ||
                                                        `CGST (${formatRate(cgstRate)}%)`;
                                                taxLines.push(`${label}: ₹${formatAmount(productCgst)}`);
                                        }
                                        if (productSgst > 0) {
                                                const label =
                                                        gstLineLookup.sgst ||
                                                        `SGST (${formatRate(sgstRate)}%)`;
                                                taxLines.push(`${label}: ₹${formatAmount(productSgst)}`);
                                        }
                                }

                                doc.text(productName, 25, yPosition);
                                doc.text(quantity.toString(), 100, yPosition);
                                doc.text(`${formatAmount(unitPrice)}`, 125, yPosition);
                                doc.text(`${formatAmount(productTotal)}`, 160, yPosition);

                                const detailLines = [];
                                if (product.productId) {
                                        detailLines.push({
                                                text: `ID: ${product.productId
                                                        .toString()
                                                        .substring(0, 10)}...`,
                                                x: 25,
                                        });
                                }
                                taxLines.forEach((line) => {
                                        detailLines.push({ text: line, x: 125 });
                                });

                                if (detailLines.length > 0) {
                                        doc.setFontSize(8);
                                        doc.setTextColor(102, 102, 102);
                                        let offset = 4;
                                        detailLines.forEach((detail) => {
                                                doc.text(detail.text, detail.x, yPosition + offset);
                                                offset += 4;
                                        });
                                        doc.setFontSize(10);
                                        doc.setTextColor(0, 0, 0);
                                        yPosition += offset - 4;
                                }

                                yPosition += 12;

                                // Line separator
                                doc.setDrawColor(229, 229, 229);
                                doc.line(20, yPosition, 190, yPosition);
                                yPosition += 5;
                        });
                }

		// Totals Section
		yPosition += 10;

		doc.setFontSize(10);
		doc.setTextColor(0, 0, 0);
		doc.text("Subtotal:", 150, yPosition);
                doc.text(`${formatAmount(order.subtotal || 0)}`, 175, yPosition);

                if (gstLineItems.length > 0) {
                        gstLineItems.forEach((line) => {
                                yPosition += 8;
                                doc.setTextColor(0, 0, 0);
                                doc.text(line.label, 150, yPosition);
                                doc.text(`${formatAmount(line.amount)}`, 175, yPosition);
                        });
                }

                if (order.shippingCost && order.shippingCost > 0) {
                        yPosition += 8;
                        doc.text("Shipping:", 150, yPosition);
                        doc.text(`${formatAmount(order.shippingCost)}`, 175, yPosition);
                }

                if (order.discount && order.discount > 0) {
                        yPosition += 8;
                        doc.setTextColor(16, 185, 129); // Green color
                        doc.text("Discount:", 150, yPosition);
                        doc.text(`-${formatAmount(order.discount)}`, 175, yPosition);
                        doc.setTextColor(0, 0, 0);
                }

                if (order.couponApplied && order.couponApplied.discountAmount > 0) {
                        yPosition += 8;
                        doc.setTextColor(59, 130, 246); // Blue color
                        doc.text(`Coupon (${order.couponApplied.couponCode}):`, 150, yPosition);
                        doc.text(
                                `-${formatAmount(order.couponApplied.discountAmount)}`,
                                175,
                                yPosition
                        );
                        doc.setTextColor(0, 0, 0);
                }

		// Line separator for total
		yPosition += 10;
		doc.setDrawColor(55, 65, 81);
		doc.line(150, yPosition, 190, yPosition);

		// Grand Total
		yPosition += 8;
		doc.setFontSize(12);
		doc.setTextColor(0, 0, 0);
		doc.text("Total Amount:-  ", 150, yPosition);
                doc.text(`  ${formatAmount(order.totalAmount || 0)}`, 175, yPosition);

		// Footer
		yPosition += 20;
		doc.setDrawColor(229, 229, 229);
		doc.line(20, yPosition, 190, yPosition);

		yPosition += 10;
		doc.setFontSize(12);
		doc.setTextColor(0, 0, 0);
		doc.text("Thank you for your business!", 20, yPosition);

		yPosition += 10;
		doc.setFontSize(10);
		doc.text("Terms & Conditions", 20, yPosition);

		yPosition += 8;
		doc.setFontSize(8);
		doc.setTextColor(102, 102, 102);
		const termsText =
			"Please contact us for any queries regarding this order. For returns and refunds, please refer to our return policy.";
		const splitTerms = doc.splitTextToSize(termsText, 170);
		doc.text(splitTerms, 20, yPosition);

		if (order.orderNotes) {
			yPosition += splitTerms.length * 4 + 8;
			doc.setFontSize(10);
			doc.setTextColor(0, 0, 0);
			doc.text("Order Notes:", 20, yPosition);

			yPosition += 6;
			doc.setFontSize(8);
			doc.setTextColor(102, 102, 102);
			const notesText = doc.splitTextToSize(order.orderNotes, 170);
			doc.text(notesText, 20, yPosition);
		}

		// Return the PDF as buffer
		return doc.output("arraybuffer");
	} catch (error) {
		console.error("Error generating PDF:", error);
		throw error;
	}
};
