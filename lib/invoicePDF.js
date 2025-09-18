import {
	Document,
	Page,
	Text,
	View,
	Image,
	StyleSheet,
	pdf,
	Font,
} from "@react-pdf/renderer";
import { companyInfo } from "@/constants/companyInfo.js";
import { buildGstLineItems, GST_RATE_PERCENT } from "@/lib/utils/gst.js";

// Register a font with the Indian Rupee symbol (₹) using a CDN that
// supports query strings so React PDF can request only the glyphs it needs.

Font.register({
	family: "Roboto",
	fonts: [
		{
			src: "https://cdn.jsdelivr.net/npm/@fontsource/roboto/files/roboto-all-400-normal.woff",
			fontWeight: "normal",
		},
		{
			src: "https://cdn.jsdelivr.net/npm/@fontsource/roboto/files/roboto-all-700-normal.woff",

			fontWeight: "bold",
		},
	],
});

const formatCurrency = (value) => {
        const numericValue = typeof value === "number" && !Number.isNaN(value) ? value : 0;
        return `₹${numericValue.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
        })}`;
};

const formatDate = (date) => {
        if (!date) return "N/A";
        const parsedDate = date instanceof Date ? date : new Date(date);
        if (Number.isNaN(parsedDate.getTime())) return "N/A";
        return parsedDate.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
        });
};

const styles = StyleSheet.create({
        page: {
                padding: 32,
                backgroundColor: "#FFFFFF",
                fontFamily: "Roboto",
                fontSize: 11,
                lineHeight: 1.4,
                color: "#1F2937",
        },
        header: {
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 24,
        },
        headerLeft: {
                maxWidth: "55%",
        },
        headerRight: {
                alignItems: "flex-end",
        },
        logo: {
                width: 150,
                height: 52,
                marginBottom: 12,
        },
        companyName: {
                fontSize: 20,
                fontWeight: "bold",
                color: "#1D4ED8",
                marginBottom: 6,
        },
        companyDetails: {
                fontSize: 10,
                color: "#4B5563",
                marginBottom: 2,
        },
        invoiceTitle: {
                fontSize: 24,
                fontWeight: "bold",
                color: "#111827",
                marginBottom: 8,
        },
        invoiceMeta: {
                fontSize: 11,
                color: "#374151",
                marginBottom: 4,
        },
        invoiceBadge: {
                marginTop: 6,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 4,
                backgroundColor: "#EEF2FF",
                color: "#4338CA",
                fontSize: 10,
                fontWeight: "bold",
        },
        divider: {
                borderBottomWidth: 1,
                borderBottomColor: "#E5E7EB",
                marginBottom: 20,
        },
        infoSection: {
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 20,
        },
        infoBlock: {
                flex: 1,
                padding: 14,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 8,
                backgroundColor: "#F9FAFB",
                marginRight: 16,
        },
        infoBlockLast: {
                marginRight: 0,
        },
        infoTitle: {
                fontSize: 11,
                fontWeight: "bold",
                color: "#1F2937",
                marginBottom: 6,
                textTransform: "uppercase",
        },
        infoText: {
                fontSize: 10,
                color: "#4B5563",
                marginBottom: 2,
        },
        orderInfo: {
                marginBottom: 24,
        },
        orderInfoRow: {
                flexDirection: "row",
                flexWrap: "wrap",
        },
        orderInfoItem: {
                width: "50%",
                marginBottom: 8,
        },
        orderInfoLabel: {
                fontSize: 10,
                color: "#6B7280",
                textTransform: "uppercase",
                marginBottom: 2,
        },
        orderInfoValue: {
                fontSize: 11,
                fontWeight: "bold",
                color: "#111827",
        },
        table: {
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 8,
                overflow: "hidden",
        },
        tableHeader: {
                flexDirection: "row",
                backgroundColor: "#F1F5F9",
        },
        tableRow: {
                flexDirection: "row",
        },
        tableRowEven: {
                backgroundColor: "#F9FAFB",
        },
        tableCol: {
                borderRightWidth: 1,
                borderRightColor: "#E5E7EB",
                justifyContent: "center",
        },
        tableColDescription: {
                flex: 3,
                padding: 10,
        },
        tableColQty: {
                flex: 1,
                padding: 10,
        },
        tableColPrice: {
                flex: 1.2,
                padding: 10,
        },
        tableColTaxType: {
                flex: 1.3,
                padding: 10,
        },
        tableColTaxAmount: {
                flex: 1.2,
                padding: 10,
        },
        tableColTotal: {
                flex: 1.3,
                padding: 10,
                borderRightWidth: 0,
        },
        tableHeaderText: {
                fontSize: 10,
                fontWeight: "bold",
                color: "#1F2937",
        },
        tableCell: {
                fontSize: 10,
                color: "#1F2937",
        },
        alignCenter: {
                textAlign: "center",
        },
        alignRight: {
                textAlign: "right",
        },
        totalsContainer: {
                marginTop: 24,
                alignSelf: "flex-end",
                width: "55%",
        },
        totalsBox: {
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 8,
                padding: 16,
                backgroundColor: "#F9FAFB",
        },
        totalsRow: {
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 6,
        },
        totalsLabel: {
                fontSize: 11,
                color: "#4B5563",
        },
        totalsValue: {
                fontSize: 11,
                color: "#111827",
        },
        grandTotalRow: {
                borderTopWidth: 1,
                borderTopColor: "#D1D5DB",
                paddingTop: 10,
                marginTop: 10,
        },
        grandTotalText: {
                fontSize: 14,
                fontWeight: "bold",
                color: "#111827",
        },
        balanceDueBox: {
                marginTop: 12,
                padding: 10,
                borderRadius: 6,
                backgroundColor: "#312E81",
        },
        balanceDueLabel: {
                fontSize: 10,
                color: "#E0E7FF",
                textTransform: "uppercase",
        },
        balanceDueValue: {
                fontSize: 14,
                fontWeight: "bold",
                color: "#F8FAFC",
        },
        notesSection: {
                marginTop: 24,
        },
        notesTitle: {
                fontSize: 12,
                fontWeight: "bold",
                color: "#1F2937",
                marginBottom: 6,
        },
        notesText: {
                fontSize: 10,
                color: "#4B5563",
                lineHeight: 1.5,
        },
        thankYou: {
                fontSize: 11,
                fontWeight: "bold",
                color: "#1D4ED8",
                marginTop: 16,
                textAlign: "center",
        },
        footer: {
                marginTop: 20,
                borderTopWidth: 1,
                borderTopColor: "#E5E7EB",
                paddingTop: 12,
        },
        footerText: {
                fontSize: 10,
                color: "#6B7280",
                marginBottom: 2,
        },
});

const InvoiceDocument = ({ order }) => {
        const logoSrc =
                typeof window === "undefined"
			? `${companyInfo.website}${companyInfo.logo}`
			: companyInfo.logo;

        const formatRateValue = (value) => {
                const numeric = Number(value);
                if (!Number.isFinite(numeric)) {
                        return "0";
                }
                if (Number.isInteger(numeric)) {
                        return numeric.toString();
                }
                return numeric.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
        };

        const gstMode = order?.gst?.mode || "igst";
        const gstRate = Number.isFinite(Number(order?.gst?.rate))
                ? Number(order.gst.rate)
                : GST_RATE_PERCENT;
        const cgstRate = gstMode === "cgst_sgst" ? gstRate / 2 : 0;
        const sgstRate = gstMode === "cgst_sgst" ? gstRate / 2 : 0;
        const igstRate = gstMode === "igst" ? gstRate : 0;
        const cgstTotal = Number(order?.gst?.cgst || 0);
        const sgstTotal = Number(order?.gst?.sgst || 0);
        const igstTotal = Number(order?.gst?.igst || 0);
        const taxableBase = Number(
                order?.gst?.taxableAmount ?? order?.taxableAmount ?? Math.max((order?.subtotal || 0) - (order?.discount || 0), 0)
        );
        const gstLineItems = buildGstLineItems(order.gst);
        const gstLineLookup = gstLineItems.reduce((acc, line) => {
                acc[line.key] = line.label;
                return acc;
        }, {});

        const orderDate = order?.orderDate ? new Date(order.orderDate) : null;
        const dueDate = order?.paymentDueDate
                ? new Date(order.paymentDueDate)
                : orderDate
                  ? new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000)
                  : null;

        const paymentMethod = order?.paymentMethod
                ? order.paymentMethod.replace("_", " ").toUpperCase()
                : "N/A";
        const paymentStatus = order?.paymentStatus ? order.paymentStatus.toUpperCase() : "N/A";
        const orderStatus = order?.status ? order.status.toUpperCase() : "N/A";
        const amountPaid =
                typeof order?.amountPaid === "number"
                        ? order.amountPaid
                        : paymentStatus === "PAID"
                          ? order?.totalAmount || 0
                          : 0;
        const balanceDue = Math.max((order?.totalAmount || 0) - amountPaid, 0);

        const totalTaxLines = gstLineItems.map((line) => ({
                label: line.label,
                amount: line.amount,
        }));

        const products = Array.isArray(order?.products) ? order.products : [];
        const billingAddress = order?.billToAddress || null;
        const shippingAddress = order?.deliveryAddress || null;

        return (
                <Document>
                        <Page size="A4" style={styles.page}>
                                <View style={styles.header}>
                                        <View style={styles.headerLeft}>
                                                <Image src={logoSrc} style={styles.logo} />
                                                <Text style={styles.companyName}>{companyInfo.name}</Text>
                                                <Text style={styles.companyDetails}>{companyInfo.email}</Text>
                                                <Text style={styles.companyDetails}>{companyInfo.website}</Text>
                                                <Text style={styles.companyDetails}>{companyInfo.phone}</Text>
                                                {companyInfo.address?.map((line, idx) => (
                                                        <Text key={idx} style={styles.companyDetails}>
                                                                {line}
                                                        </Text>
                                                ))}
                                                {companyInfo.taxId && (
                                                        <Text style={styles.companyDetails}>{companyInfo.taxId}</Text>
                                                )}
                                        </View>
                                        <View style={styles.headerRight}>
                                                <Text style={styles.invoiceTitle}>INVOICE</Text>
                                                <Text style={styles.invoiceMeta}>Invoice #: {order?.orderNumber || "N/A"}</Text>
                                                <Text style={styles.invoiceMeta}>Invoice Date: {formatDate(orderDate)}</Text>
                                                <Text style={styles.invoiceMeta}>Due Date: {formatDate(dueDate)}</Text>
                                                <Text style={styles.invoiceMeta}>Order Status: {orderStatus}</Text>
                                                <Text style={styles.invoiceMeta}>Payment Method: {paymentMethod}</Text>
                                                <Text style={styles.invoiceBadge}>{paymentStatus}</Text>
                                        </View>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.infoSection}>
                                        <View style={styles.infoBlock}>
                                                <Text style={styles.infoTitle}>Billed To</Text>
                                                {billingAddress ? (
                                                        <>
                                                                {billingAddress.name && (
                                                                        <Text style={styles.infoText}>{billingAddress.name}</Text>
                                                                )}
                                                                {billingAddress.street && (
                                                                        <Text style={styles.infoText}>{billingAddress.street}</Text>
                                                                )}
                                                                {(billingAddress.city || billingAddress.state || billingAddress.zipCode) && (
                                                                        <Text style={styles.infoText}>
                                                                                {billingAddress.city || ""}
                                                                                {billingAddress.state ? `, ${billingAddress.state}` : ""}
                                                                                {billingAddress.zipCode ? ` - ${billingAddress.zipCode}` : ""}
                                                                        </Text>
                                                                )}
                                                                {billingAddress.country && (
                                                                        <Text style={styles.infoText}>{billingAddress.country}</Text>
                                                                )}
                                                                {billingAddress.gstin && (
                                                                        <Text style={styles.infoText}>GSTIN: {billingAddress.gstin}</Text>
                                                                )}
                                                        </>
                                                ) : (
                                                        <>
                                                                {order?.customerName && (
                                                                        <Text style={styles.infoText}>{order.customerName}</Text>
                                                                )}
                                                                {order?.customerEmail && (
                                                                        <Text style={styles.infoText}>{order.customerEmail}</Text>
                                                                )}
                                                                {order?.customerMobile && (
                                                                        <Text style={styles.infoText}>{order.customerMobile}</Text>
                                                                )}
                                                        </>
                                                )}
                                        </View>
                                        <View style={[styles.infoBlock, styles.infoBlockLast]}>
                                                <Text style={styles.infoTitle}>Shipping Address</Text>
                                                {shippingAddress ? (
                                                        <>
                                                                {shippingAddress.name && (
                                                                        <Text style={styles.infoText}>{shippingAddress.name}</Text>
                                                                )}
                                                                {shippingAddress.street && (
                                                                        <Text style={styles.infoText}>{shippingAddress.street}</Text>
                                                                )}
                                                                {(shippingAddress.city || shippingAddress.state || shippingAddress.zipCode) && (
                                                                        <Text style={styles.infoText}>
                                                                                {shippingAddress.city || ""}
                                                                                {shippingAddress.state ? `, ${shippingAddress.state}` : ""}
                                                                                {shippingAddress.zipCode ? ` - ${shippingAddress.zipCode}` : ""}
                                                                        </Text>
                                                                )}
                                                                {shippingAddress.country && (
                                                                        <Text style={styles.infoText}>{shippingAddress.country}</Text>
                                                                )}
                                                        </>
                                                ) : billingAddress ? (
                                                        <Text style={styles.infoText}>Same as billing address</Text>
                                                ) : (
                                                        <Text style={styles.infoText}>Shipping address not provided</Text>
                                                )}
                                        </View>
                                </View>

                                <View style={styles.orderInfo}>
                                        <View style={styles.orderInfoRow}>
                                                <View style={styles.orderInfoItem}>
                                                        <Text style={styles.orderInfoLabel}>Order Number</Text>
                                                        <Text style={styles.orderInfoValue}>{order?.orderNumber || "N/A"}</Text>
                                                </View>
                                                <View style={styles.orderInfoItem}>
                                                        <Text style={styles.orderInfoLabel}>Order Date</Text>
                                                        <Text style={styles.orderInfoValue}>{formatDate(orderDate)}</Text>
                                                </View>
                                                <View style={styles.orderInfoItem}>
                                                        <Text style={styles.orderInfoLabel}>Due Date</Text>
                                                        <Text style={styles.orderInfoValue}>{formatDate(dueDate)}</Text>
                                                </View>
                                                <View style={styles.orderInfoItem}>
                                                        <Text style={styles.orderInfoLabel}>Payment Method</Text>
                                                        <Text style={styles.orderInfoValue}>{paymentMethod}</Text>
                                                </View>
                                                <View style={styles.orderInfoItem}>
                                                        <Text style={styles.orderInfoLabel}>Payment Status</Text>
                                                        <Text style={styles.orderInfoValue}>{paymentStatus}</Text>
                                                </View>
                                                {order?.shippingMethod && (
                                                        <View style={styles.orderInfoItem}>
                                                                <Text style={styles.orderInfoLabel}>Shipping Method</Text>
                                                                <Text style={styles.orderInfoValue}>{order.shippingMethod}</Text>
                                                        </View>
                                                )}
                                                {order?.reference && (
                                                        <View style={styles.orderInfoItem}>
                                                                <Text style={styles.orderInfoLabel}>Reference</Text>
                                                                <Text style={styles.orderInfoValue}>{order.reference}</Text>
                                                        </View>
                                                )}
                                        </View>
                                </View>

                                <View style={styles.table}>
                                        <View style={styles.tableHeader}>
                                                <View style={[styles.tableCol, styles.tableColDescription]}>
                                                        <Text style={styles.tableHeaderText}>Item Description</Text>
                                                </View>
                                                <View style={[styles.tableCol, styles.tableColQty]}>
                                                        <Text style={[styles.tableHeaderText, styles.alignCenter]}>Qty</Text>
                                                </View>
                                                <View style={[styles.tableCol, styles.tableColPrice]}>
                                                        <Text style={[styles.tableHeaderText, styles.alignRight]}>Price</Text>
                                                </View>
                                                <View style={[styles.tableCol, styles.tableColTaxType]}>
                                                        <Text style={[styles.tableHeaderText, styles.alignCenter]}>Tax Type</Text>
                                                </View>
                                                <View style={[styles.tableCol, styles.tableColTaxAmount]}>
                                                        <Text style={[styles.tableHeaderText, styles.alignRight]}>Tax Amount</Text>
                                                </View>
                                                <View style={[styles.tableCol, styles.tableColTotal]}>
                                                        <Text style={[styles.tableHeaderText, styles.alignRight]}>Amount</Text>
                                                </View>
                                        </View>
                                        {products.map((product, index) => {
                                                const quantity = Number.isFinite(Number(product.quantity))
                                                        ? Number(product.quantity)
                                                        : 0;
                                                const unitPrice = Number.isFinite(Number(product.price))
                                                        ? Number(product.price)
                                                        : 0;
                                                const productTotal = Number.isFinite(Number(product.totalPrice))
                                                        ? Number(product.totalPrice)
                                                        : unitPrice * quantity;

                                                const productName = product.productName || product.name || product.title || "Item";
                                                const displayQuantity = Number.isFinite(quantity) ? quantity : "-";

                                                const share = taxableBase > 0 ? productTotal / taxableBase : 0;
                                                const productCgst = share * cgstTotal;
                                                const productSgst = share * sgstTotal;
                                                const productIgst = share * igstTotal;

                                                let taxType = "-";
                                                let taxAmountStr = "-";
                                                if (gstMode === "igst" && productIgst > 0) {
                                                        taxType =
                                                                gstLineLookup.igst ||
                                                                `IGST (${formatRateValue(igstRate)}%)`;
                                                        taxAmountStr = formatCurrency(productIgst);
                                                } else if (gstMode === "cgst_sgst") {
                                                        const taxTypeParts = [];
                                                        const taxAmountParts = [];
                                                        if (productCgst > 0) {
                                                                taxTypeParts.push(
                                                                        gstLineLookup.cgst ||
                                                                                `CGST (${formatRateValue(cgstRate)}%)`
                                                                );
                                                                taxAmountParts.push(formatCurrency(productCgst));
                                                        }
                                                        if (productSgst > 0) {
                                                                taxTypeParts.push(
                                                                        gstLineLookup.sgst ||
                                                                                `SGST (${formatRateValue(sgstRate)}%)`
                                                                );
                                                                taxAmountParts.push(formatCurrency(productSgst));
                                                        }
                                                        if (taxTypeParts.length > 0) {
                                                                taxType = taxTypeParts.join("\n");
                                                                taxAmountStr = taxAmountParts.join("\n");
                                                        }
                                                }

                                                const productTax = productCgst + productSgst + productIgst;
                                                const amountWithTax = productTotal + productTax;

                                                return (
                                                        <View
                                                                key={index}
                                                                style={[
                                                                        styles.tableRow,
                                                                        index % 2 === 1 ? styles.tableRowEven : {},
                                                                ]}
                                                        >
                                                                <View style={[styles.tableCol, styles.tableColDescription]}>
                                                                        <Text style={styles.tableCell}>{productName}</Text>
                                                                </View>
                                                                <View style={[styles.tableCol, styles.tableColQty]}>
                                                                        <Text style={[styles.tableCell, styles.alignCenter]}>{displayQuantity}</Text>
                                                                </View>
                                                                <View style={[styles.tableCol, styles.tableColPrice]}>
                                                                        <Text style={[styles.tableCell, styles.alignRight]}>
                                                                                {formatCurrency(unitPrice)}
                                                                        </Text>
                                                                </View>
                                                                <View style={[styles.tableCol, styles.tableColTaxType]}>
                                                                        <Text style={[styles.tableCell, styles.alignCenter]}>{taxType}</Text>
                                                                </View>
                                                                <View style={[styles.tableCol, styles.tableColTaxAmount]}>
                                                                        <Text style={[styles.tableCell, styles.alignRight]}>{taxAmountStr}</Text>
                                                                </View>
                                                                <View style={[styles.tableCol, styles.tableColTotal]}>
                                                                        <Text style={[styles.tableCell, styles.alignRight]}>
                                                                                {formatCurrency(amountWithTax)}
                                                                        </Text>
                                                                </View>
                                                        </View>
                                                );
                                        })}
                                </View>

                                <View style={styles.totalsContainer}>
                                        <View style={styles.totalsBox}>
                                                <View style={styles.totalsRow}>
                                                        <Text style={styles.totalsLabel}>Subtotal</Text>
                                                        <Text style={styles.totalsValue}>{formatCurrency(order?.subtotal || 0)}</Text>
                                                </View>
                                                {totalTaxLines.map((tax, idx) => (
                                                        <View style={styles.totalsRow} key={idx}>
                                                                <Text style={styles.totalsLabel}>{tax.label}</Text>
                                                                <Text style={styles.totalsValue}>{formatCurrency(tax.amount)}</Text>
                                                        </View>
                                                ))}
                                                {order.shippingCost > 0 && (
                                                        <View style={styles.totalsRow}>
                                                                <Text style={styles.totalsLabel}>Shipping</Text>
                                                                <Text style={styles.totalsValue}>{formatCurrency(order.shippingCost)}</Text>
                                                        </View>
                                                )}
                                                {order.discount > 0 && (
                                                        <View style={styles.totalsRow}>
                                                                <Text style={styles.totalsLabel}>Discount</Text>
                                                                <Text style={styles.totalsValue}>- {formatCurrency(order.discount)}</Text>
                                                        </View>
                                                )}
                                                {amountPaid > 0 && (
                                                        <View style={styles.totalsRow}>
                                                                <Text style={styles.totalsLabel}>Amount Paid</Text>
                                                                <Text style={styles.totalsValue}>- {formatCurrency(amountPaid)}</Text>
                                                        </View>
                                                )}
                                                <View style={[styles.totalsRow, styles.grandTotalRow]}>
                                                        <Text style={styles.grandTotalText}>Grand Total</Text>
                                                        <Text style={styles.grandTotalText}>{formatCurrency(order?.totalAmount || 0)}</Text>
                                                </View>
                                                <View style={styles.balanceDueBox}>
                                                        <Text style={styles.balanceDueLabel}>Balance Due</Text>
                                                        <Text style={styles.balanceDueValue}>{formatCurrency(balanceDue)}</Text>
                                                </View>
                                        </View>
                                </View>

                                <View style={styles.notesSection}>
                                        <Text style={styles.notesTitle}>Notes</Text>
                                        <Text style={styles.notesText}>
                                                Thank you for choosing Safety Online. Please retain this invoice for your records.
                                                Goods once sold are subject to our return and warranty policies. Contact our support
                                                team for any clarification within 7 days of delivery.
                                        </Text>
                                </View>

                                <Text style={styles.thankYou}>Thank you for your business!</Text>

                                <View style={styles.footer}>
                                        <Text style={styles.footerText}>
                                                For any assistance contact {companyInfo.email} or {companyInfo.phone}.
                                        </Text>
                                        {companyInfo.website && (
                                                <Text style={styles.footerText}>{companyInfo.website}</Text>
                                        )}
                                </View>
                        </Page>

                </Document>
        );
};

export const generateInvoicePDF = async (order) => {
	const doc = <InvoiceDocument order={order} />;
	// On the server we generate a Buffer, in the browser we generate a Blob
	if (typeof window === "undefined") {
		const pdfBuffer = await pdf(doc).toBuffer();
		return pdfBuffer;
	}
	const pdfBlob = await pdf(doc).toBlob();
	return pdfBlob;
};

export const generateInvoicePDFAsBase64 = async (order) => {
	try {
		// Use your existing generateInvoicePDF function
		const pdfBlob = await generateInvoicePDF(order);

		// Convert blob to base64
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => {
				// Remove the data:application/pdf;base64, prefix
				const base64 = reader.result.split(",")[1];
				resolve(base64);
			};
			reader.onerror = reject;
			reader.readAsDataURL(pdfBlob);
		});
	} catch (error) {
		console.error("Client-side PDF generation failed:", error);
		throw error;
	}
};

export default InvoiceDocument;
