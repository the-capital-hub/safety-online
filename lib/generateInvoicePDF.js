import jsPDF from "jspdf";

export const generateInvoicePDF = async (order) => {
	try {
		// Create new jsPDF instance
		const doc = new jsPDF();

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
		doc.text("+91 9945234161", 20, 50);

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

		if (order.deliveryAddress) {
			doc.text(order.deliveryAddress.street || "", 20, 100);
			doc.text(
				`${order.deliveryAddress.city || ""}, ${
					order.deliveryAddress.state || ""
				}`,
				20,
				105
			);
			doc.text(
				`${order.deliveryAddress.zipCode || ""}, ${
					order.deliveryAddress.country || ""
				}`,
				20,
				110
			);
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
		doc.text(`${(order.totalAmount || 0).toFixed(2)}`, 150, 125);

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
			order.products.forEach((product, index) => {
				if (yPosition > 250) {
					doc.addPage();
					yPosition = 30;
				}

				doc.setFontSize(10);
				doc.setTextColor(0, 0, 0);

				// Truncate long product names
				const productName = product.productName.substring(0, 30);
				doc.text(productName, 25, yPosition);
				doc.text((product.quantity || 0).toString(), 100, yPosition);
				doc.text(`${(product.price || 0).toFixed(2)}`, 125, yPosition);
				doc.text(`${(product.totalPrice || 0).toFixed(2)}`, 160, yPosition);

				if (product.productId) {
					doc.setFontSize(8);
					doc.setTextColor(102, 102, 102);
					doc.text(
						`ID: ${product.productId.toString().substring(0, 10)}...`,
						25,
						yPosition + 4
					);
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
		doc.text(`${(order.subtotal || 0).toFixed(2)}`, 175, yPosition);

		if (order.tax && order.tax > 0) {
			yPosition += 8;
			doc.text("Tax:", 150, yPosition);
			doc.text(`${order.tax.toFixed(2)}`, 175, yPosition);
		}

		if (order.shippingCost && order.shippingCost > 0) {
			yPosition += 8;
			doc.text("Shipping:", 150, yPosition);
			doc.text(`${order.shippingCost.toFixed(2)}`, 175, yPosition);
		}

		if (order.discount && order.discount > 0) {
			yPosition += 8;
			doc.setTextColor(16, 185, 129); // Green color
			doc.text("Discount:", 150, yPosition);
			doc.text(`-${order.discount.toFixed(2)}`, 175, yPosition);
		}

		if (order.couponApplied && order.couponApplied.discountAmount > 0) {
			yPosition += 8;
			doc.setTextColor(59, 130, 246); // Blue color
			doc.text(`Coupon (${order.couponApplied.couponCode}):`, 150, yPosition);
			// doc.text(
			// 	`-${order.couponApplied.discountAmount.toFixed(2)}`,
			// 	175,
			// 	yPosition
			// );
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
		doc.text(`  ${(order.totalAmount || 0).toFixed(2)}`, 175, yPosition);

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
