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
                flexDirection: "column",
                backgroundColor: "#F3F4F6",
                padding: 32,
                fontSize: 12,
                fontFamily: "Roboto",
                lineHeight: 1.3,
        },
        card: {
                flexGrow: 1,
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                padding: 28,
        },
        header: {
                backgroundColor: "#0B1120",
                borderRadius: 12,
                padding: 18,
                marginBottom: 24,
        },
        headerContent: {
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
        },
        companyInfo: {
                flexDirection: "column",
                flex: 1,
        },
        companyName: {
                fontSize: 18,
                fontWeight: "bold",
                color: "#F8FAFC",
                marginBottom: 4,
        },
        companyDetails: {
                color: "#CBD5F5",
                marginBottom: 2,
        },
        logo: {
                width: 150,
                height: 50,
                marginBottom: 12,
        },
        invoiceInfo: {
                flexDirection: "column",
                alignItems: "flex-end",
                justifyContent: "space-between",
        },
        invoiceTitle: {
                fontSize: 22,
                fontWeight: "bold",
                color: "#FFFFFF",
                letterSpacing: 1,
        },
        invoiceMeta: {
                color: "#E0E7FF",
                marginBottom: 4,
        },
        invoiceBadge: {
                marginTop: 8,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: "#1E293B",
                color: "#C7D2FE",
                fontSize: 10,
                fontWeight: "bold",
        },
        summaryGrid: {
                flexDirection: "row",
                flexWrap: "wrap",
                marginBottom: 24,
        },
        summaryCard: {
                width: "48%",
                backgroundColor: "#F8FAFC",
                borderWidth: 1,
                borderColor: "#E2E8F0",
                borderRadius: 12,
                padding: 14,
                marginRight: "4%",
                marginBottom: 12,
        },
        summaryCardEven: {
                marginRight: 0,
        },
        summaryLabel: {
                color: "#6B7280",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: 0.8,
        },
        summaryValue: {
                fontSize: 14,
                fontWeight: "bold",
                color: "#111827",
                marginTop: 6,
        },
        section: {
                marginBottom: 18,
        },
        sectionTitle: {
                fontSize: 14,
                fontWeight: "bold",
                marginBottom: 8,
                color: "#374151",
        },
        infoRow: {
                flexDirection: "row",
                justifyContent: "space-between",
        },
        infoColumn: {
                flex: 1,
                backgroundColor: "#F9FAFB",
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                padding: 12,
                marginRight: 18,
        },
        infoColumnLast: {
                marginRight: 0,
        },
        infoLabel: {
                color: "#6B7280",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                marginBottom: 4,
        },
        infoValue: {
                color: "#111827",
                fontSize: 12,
                marginBottom: 2,
        },
        row: {
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 2,
        },
        table: {
                display: "table",
                width: "auto",
                borderStyle: "solid",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 10,
                overflow: "hidden",
                marginBottom: 16,
        },
        tableRow: {
                flexDirection: "row",
        },
        tableHeader: {
                backgroundColor: "#E0E7FF",
                fontWeight: "bold",
        },
        tableCol: {
                borderStyle: "solid",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                padding: 8,
        },
        tableColProduct: {
                width: "34%",
        },
        tableColSmall: {
                width: "12%",
        },
        tableCell: {
                fontSize: 10,
                color: "#1F2937",
        },
        tableHeaderCell: {
                fontSize: 10,
                color: "#1E293B",
        },
        tableRowStriped: {
                backgroundColor: "#F9FAFB",
        },
        alignRight: {
                textAlign: "right",
        },
        fullWidth: {
                width: "100%",
        },
        metaGrid: {
                flexDirection: "row",
                flexWrap: "wrap",
                marginTop: 12,
        },
        metaCard: {
                flexGrow: 1,
                minWidth: "30%",
                backgroundColor: "#F9FAFB",
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                padding: 10,
                marginRight: 12,
                marginBottom: 12,
        },
        metaLabel: {
                fontSize: 10,
                color: "#6B7280",
                marginBottom: 4,
                textTransform: "uppercase",
        },
        metaValue: {
                fontSize: 12,
                color: "#111827",
        },
        totalSection: {
                marginTop: 4,
                paddingTop: 12,
        },
        totalsCard: {
                backgroundColor: "#F8FAFC",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                padding: 16,
        },
        totalRow: {
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 2,
		width: "100%",
	},
        totalLabel: {
                color: "#4B5563",
        },
        grandTotal: {
                fontSize: 16,
                fontWeight: "bold",
                marginTop: 10,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: "#D1D5DB",
        },
        balanceDueBox: {
                marginTop: 14,
                padding: 12,
                borderRadius: 10,
                backgroundColor: "#312E81",
        },
        balanceDueLabel: {
                color: "#C7D2FE",
                fontSize: 10,
                textTransform: "uppercase",
        },
        balanceDueValue: {
                fontSize: 16,
                fontWeight: "bold",
                color: "#F8FAFC",
        },
        footer: {
                marginTop: 20,
                borderTopWidth: 1,
                borderTopColor: "#E5E7EB",
                paddingTop: 12,
                fontSize: 10,
                color: "#6B7280",
        },
        notesSection: {
                marginTop: 12,
                padding: 14,
                borderRadius: 10,
                backgroundColor: "#F9FAFB",
                borderWidth: 1,
                borderColor: "#E5E7EB",
        },
        notesText: {
                fontSize: 10,
                color: "#4B5563",
                lineHeight: 1.4,
        },
        signatureSection: {
                marginTop: 18,
                flexDirection: "row",
                justifyContent: "space-between",
        },
        signatureBlock: {
                width: "45%",
                marginRight: 18,
        },
        signatureBlockLast: {
                marginRight: 0,
        },
        signatureLine: {
                marginTop: 18,
                borderTopWidth: 1,
                borderTopColor: "#D1D5DB",
                paddingTop: 6,
                textAlign: "center",
                fontSize: 10,
                color: "#6B7280",
        },
});

const InvoiceDocument = ({ order }) => {
        const logoSrc =
                typeof window === "undefined"
			? `${companyInfo.website}${companyInfo.logo}`
			: companyInfo.logo;

	const cgstRate = order.subtotal
		? (order.gst?.cgst / order.subtotal) * 100
		: 0;
	const sgstRate = order.subtotal
		? (order.gst?.sgst / order.subtotal) * 100
		: 0;
	const igstRate = order.subtotal
		? (order.gst?.igst / order.subtotal) * 100
		: 0;

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

        const totalTaxLines = [];
        if (order.gst?.igst > 0) {
                totalTaxLines.push({
                        label: `IGST ${igstRate.toFixed(0)}%`,
                        amount: order.gst.igst,
                });
	} else {
		if (order.gst?.cgst > 0) {
			totalTaxLines.push({
				label: `CGST ${cgstRate.toFixed(0)}%`,
				amount: order.gst.cgst,
			});
		}
		if (order.gst?.sgst > 0) {
			totalTaxLines.push({
				label: `SGST ${sgstRate.toFixed(0)}%`,
				amount: order.gst.sgst,
			});
		}
	}

        return (
                <Document>
                        <Page size="A4" style={styles.page}>
                                <View style={styles.card}>
                                        {/* Header */}
                                        <View style={styles.header}>
                                                <View style={styles.headerContent}>
                                                        <View style={styles.companyInfo}>
                                                                <Image src={logoSrc} style={styles.logo} />
                                                                <Text style={styles.companyName}>{companyInfo.name}</Text>
                                                                <Text style={styles.companyDetails}>{companyInfo.website}</Text>
                                                                <Text style={styles.companyDetails}>{companyInfo.email}</Text>
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
                                                        <View style={styles.invoiceInfo}>
                                                                <Text style={styles.invoiceTitle}>INVOICE</Text>
                                                                <Text style={styles.invoiceMeta}>
                                                                        Invoice #: {order?.orderNumber || "N/A"}
                                                                </Text>
                                                                <Text style={styles.invoiceMeta}>
                                                                        Issued: {formatDate(orderDate)}
                                                                </Text>
                                                                <Text style={styles.invoiceMeta}>Status: {orderStatus}</Text>
                                                                <Text style={styles.invoiceBadge}>{paymentStatus}</Text>
                                                        </View>
                                                </View>
                                        </View>

                                        {/* Invoice Summary */}
                                        <View style={styles.summaryGrid}>
                                                <View style={styles.summaryCard}>
                                                        <Text style={styles.summaryLabel}>Invoice Date</Text>
                                                        <Text style={styles.summaryValue}>{formatDate(orderDate)}</Text>
                                                </View>
                                                <View style={[styles.summaryCard, styles.summaryCardEven]}>
                                                        <Text style={styles.summaryLabel}>Due Date</Text>
                                                        <Text style={styles.summaryValue}>{formatDate(dueDate)}</Text>
                                                </View>
                                                <View style={styles.summaryCard}>
                                                        <Text style={styles.summaryLabel}>Payment Method</Text>
                                                        <Text style={styles.summaryValue}>{paymentMethod}</Text>
                                                </View>
                                                <View style={[styles.summaryCard, styles.summaryCardEven]}>
                                                        <Text style={styles.summaryLabel}>Order Total</Text>
                                                        <Text style={styles.summaryValue}>
                                                                {formatCurrency(order?.totalAmount || 0)}
                                                        </Text>
                                                </View>
                                        </View>

                                        {/* Customer Information */}
                                        <View style={styles.section}>
                                                <Text style={styles.sectionTitle}>Client Information</Text>
                                                <View style={styles.infoRow}>
                                                        <View style={styles.infoColumn}>
                                                                <Text style={styles.infoLabel}>Bill To</Text>
                                                                {order.billToAddress ? (
                                                                        <>
                                                                                {order.billToAddress.name && (
                                                                                        <Text style={styles.infoValue}>
                                                                                                {order.billToAddress.name}
                                                                                        </Text>
                                                                                )}
                                                                                <Text style={styles.infoValue}>
                                                                                        {order.billToAddress.street}
                                                                                </Text>
                                                                                <Text style={styles.infoValue}>
                                                                                        {order.billToAddress.city}, {order.billToAddress.state} - {order.billToAddress.zipCode}
                                                                                </Text>
                                                                                <Text style={styles.infoValue}>
                                                                                        {order.billToAddress.country}
                                                                                </Text>
                                                                                {order.billToAddress.gstin && (
                                                                                        <Text style={styles.infoValue}>
                                                                                                GSTIN: {order.billToAddress.gstin}
                                                                                        </Text>
                                                                                )}
                                                                        </>
                                                                ) : (
                                                                        <>
                                                                                {order.customerName && (
                                                                                        <Text style={styles.infoValue}>{order.customerName}</Text>
                                                                                )}
                                                                                {order.customerEmail && (
                                                                                        <Text style={styles.infoValue}>{order.customerEmail}</Text>
                                                                                )}
                                                                                {order.customerMobile && (
                                                                                        <Text style={styles.infoValue}>{order.customerMobile}</Text>
                                                                                )}
                                                                        </>
                                                                )}
                                                        </View>
                                                        {order.deliveryAddress && (
                                                                <View style={[styles.infoColumn, styles.infoColumnLast]}>
                                                                        <Text style={styles.infoLabel}>Ship To</Text>
                                                                        {order.deliveryAddress.name && (
                                                                                <Text style={styles.infoValue}>
                                                                                        {order.deliveryAddress.name}
                                                                                </Text>
                                                                        )}
                                                                        <Text style={styles.infoValue}>
                                                                                {order.deliveryAddress.street}
                                                                        </Text>
                                                                        <Text style={styles.infoValue}>
                                                                                {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.zipCode}
                                                                        </Text>
                                                                        <Text style={styles.infoValue}>
                                                                                {order.deliveryAddress.country}
                                                                        </Text>
                                                                </View>
                                                        )}
                                                </View>
                                        </View>

                                        {/* Order Details */}
                                        <View style={styles.section}>
                                                <Text style={styles.sectionTitle}>Order Snapshot</Text>
                                                <View style={styles.metaGrid}>
                                                        <View style={styles.metaCard}>
                                                                <Text style={styles.metaLabel}>Order Number</Text>
                                                                <Text style={styles.metaValue}>{order?.orderNumber || "N/A"}</Text>
                                                        </View>
                                                        <View style={styles.metaCard}>
                                                                <Text style={styles.metaLabel}>Order Date</Text>
                                                                <Text style={styles.metaValue}>{formatDate(orderDate)}</Text>
                                                        </View>
                                                        <View style={styles.metaCard}>
                                                                <Text style={styles.metaLabel}>Order Status</Text>
                                                                <Text style={styles.metaValue}>{orderStatus}</Text>
                                                        </View>
                                                        <View style={styles.metaCard}>
                                                                <Text style={styles.metaLabel}>Payment Status</Text>
                                                                <Text style={styles.metaValue}>{paymentStatus}</Text>
                                                        </View>
                                                        {order?.shippingMethod && (
                                                                <View style={styles.metaCard}>
                                                                        <Text style={styles.metaLabel}>Shipping Method</Text>
                                                                        <Text style={styles.metaValue}>
                                                                                {order.shippingMethod}
                                                                        </Text>
                                                                </View>
                                                        )}
                                                        {order?.reference && (
                                                                <View style={styles.metaCard}>
                                                                        <Text style={styles.metaLabel}>Reference</Text>
                                                                        <Text style={styles.metaValue}>{order.reference}</Text>
                                                                </View>
                                                        )}
                                                </View>
                                        </View>

                                        {/* Products Table with Tax */}
                                        <View style={[styles.table, styles.fullWidth]}>
                                                <View style={[styles.tableRow, styles.tableHeader]}>
                                                        <View style={[styles.tableCol, styles.tableColProduct]}>
                                                                <Text style={styles.tableHeaderCell}>Product</Text>
                                                        </View>
                                                        <View style={[styles.tableCol, styles.tableColSmall]}>
                                                                <Text style={styles.tableHeaderCell}>Quantity</Text>
                                                        </View>
                                                        <View style={[styles.tableCol, styles.tableColSmall]}>
                                                                <Text style={[styles.tableHeaderCell, styles.alignRight]}>Price</Text>
                                                        </View>
                                                        <View style={[styles.tableCol, styles.tableColSmall]}>
                                                                <Text style={styles.tableHeaderCell}>Tax Type</Text>
                                                        </View>
                                                        <View style={[styles.tableCol, styles.tableColSmall]}>
                                                                <Text style={[styles.tableHeaderCell, styles.alignRight]}>
                                                                        Tax Amount
                                                                </Text>
                                                        </View>
                                                        <View style={[styles.tableCol, styles.tableColSmall]}>
                                                                <Text style={[styles.tableHeaderCell, styles.alignRight]}>
                                                                        Amount with Tax
                                                                </Text>
                                                        </View>
                                                </View>

                                        {order.products.map((product, index) => {
                                                const cgstTotal = order.gst?.cgst || 0;
                                                const sgstTotal = order.gst?.sgst || 0;
                                                const igstTotal = order.gst?.igst || 0;

						const productCgst =
							order.subtotal > 0
								? (product.totalPrice / order.subtotal) * cgstTotal
								: 0;
						const productSgst =
							order.subtotal > 0
								? (product.totalPrice / order.subtotal) * sgstTotal
								: 0;
						const productIgst =
							order.subtotal > 0
								? (product.totalPrice / order.subtotal) * igstTotal
								: 0;

						let taxType = "";
						let taxAmountStr = "";
						if (igstTotal > 0) {
							taxType = `IGST ${igstRate.toFixed(0)}%`;
							taxAmountStr = formatCurrency(productIgst);
						} else if (cgstTotal > 0 || sgstTotal > 0) {
							taxType = `CGST ${cgstRate.toFixed(0)}%\nSGST ${sgstRate.toFixed(
								0
							)}%`; // <-- single \n
							taxAmountStr = `${formatCurrency(productCgst)}\n${formatCurrency(
								productSgst
							)}`; // <-- single \n
						}

						const productTax = productCgst + productSgst + productIgst;
						const amountWithTax = product.totalPrice + productTax;

                                                return (
                                                        <View
                                                                style={[
                                                                        styles.tableRow,
                                                                        index % 2 === 1 ? styles.tableRowStriped : {},
                                                                ]}
                                                                key={index}
                                                        >
                                                                <View style={[styles.tableCol, styles.tableColProduct]}>
                                                                        <Text style={styles.tableCell}>{product.productName}</Text>
                                                                </View>
                                                                <View style={[styles.tableCol, styles.tableColSmall]}>
                                                                        <Text style={styles.tableCell}>{product.quantity}</Text>
                                                                </View>
                                                                <View style={[styles.tableCol, styles.tableColSmall]}>
                                                                        <Text style={[styles.tableCell, styles.alignRight]}>
                                                                                {formatCurrency(product.price)}
                                                                        </Text>
                                                                </View>
                                                                <View style={[styles.tableCol, styles.tableColSmall]}>
                                                                        <Text style={styles.tableCell}>{taxType}</Text>
                                                                </View>
                                                                <View style={[styles.tableCol, styles.tableColSmall]}>
                                                                        <Text style={[styles.tableCell, styles.alignRight]}>
                                                                                {taxAmountStr}
                                                                        </Text>
                                                                </View>
                                                                <View style={[styles.tableCol, styles.tableColSmall]}>
                                                                        <Text style={[styles.tableCell, styles.alignRight]}>
                                                                                {formatCurrency(amountWithTax)}
                                                                        </Text>
                                                                </View>
                                                        </View>
                                                );
                                        })}
                                        </View>

                                        {/* Totals */}
                                        <View style={styles.totalSection}>
                                                <View style={styles.totalsCard}>
                                                        <View style={styles.totalRow}>
                                                                <Text style={styles.totalLabel}>Subtotal</Text>
                                                                <Text style={styles.alignRight}>
                                                                        {formatCurrency(order?.subtotal || 0)}
                                                                </Text>
                                                        </View>
                                                        {totalTaxLines.map((tax, idx) => (
                                                                <View style={styles.totalRow} key={idx}>
                                                                        <Text style={styles.totalLabel}>{`${tax.label}`}</Text>
                                                                        <Text style={styles.alignRight}>
                                                                                {formatCurrency(tax.amount)}
                                                                        </Text>
                                                                </View>
                                                        ))}
                                                        {order.shippingCost > 0 && (
                                                                <View style={styles.totalRow}>
                                                                        <Text style={styles.totalLabel}>Shipping</Text>
                                                                        <Text style={styles.alignRight}>
                                                                                {formatCurrency(order.shippingCost)}
                                                                        </Text>
                                                                </View>
                                                        )}
                                                        {order.discount > 0 && (
                                                                <View style={styles.totalRow}>
                                                                        <Text style={styles.totalLabel}>Discount</Text>
                                                                        <Text style={styles.alignRight}>
                                                                                -{formatCurrency(order.discount)}
                                                                        </Text>
                                                                </View>
                                                        )}
                                                        {typeof amountPaid === "number" && amountPaid > 0 && (
                                                                <View style={styles.totalRow}>
                                                                        <Text style={styles.totalLabel}>Amount Paid</Text>
                                                                        <Text style={styles.alignRight}>
                                                                                -{formatCurrency(amountPaid)}
                                                                        </Text>
                                                                </View>
                                                        )}
                                                        <View style={[styles.totalRow, styles.grandTotal]}>
                                                                <Text>Total Amount</Text>
                                                                <Text style={styles.alignRight}>
                                                                        {formatCurrency(order?.totalAmount || 0)}
                                                                </Text>
                                                        </View>
                                                        <View style={styles.balanceDueBox}>
                                                                <Text style={styles.balanceDueLabel}>Balance Due</Text>
                                                                <Text style={styles.balanceDueValue}>
                                                                        {formatCurrency(balanceDue)}
                                                                </Text>
                                                        </View>
                                                </View>
                                        </View>

                                        {/* Notes */}
                                        <View style={styles.notesSection}>
                                                <Text style={styles.sectionTitle}>Important Notes</Text>
                                                <Text style={styles.notesText}>
                                                        Thank you for choosing Safety Online. Please retain this invoice for your
                                                        records. Goods once sold are subject to our return and warranty policies.
                                                        Contact our support team for any clarification within 7 days of delivery.
                                                </Text>
                                        </View>

                                        {/* Footer */}
                                        <View style={styles.signatureSection}>
                                                <View style={styles.signatureBlock}>
                                                        <Text style={styles.sectionTitle}>Prepared By</Text>
                                                        <Text style={styles.notesText}>{companyInfo.name} Accounts Team</Text>
                                                        <Text style={styles.signatureLine}>Authorised Signature</Text>
                                                </View>
                                                <View style={[styles.signatureBlock, styles.signatureBlockLast]}>
                                                        <Text style={styles.sectionTitle}>Customer Acknowledgement</Text>
                                                        <Text style={styles.notesText}>Received by: ________________________</Text>
                                                        <Text style={styles.signatureLine}>Signature &amp; Seal</Text>
                                                </View>
                                        </View>

                                        <View style={styles.footer}>
                                                <Text>For support, reach out at {companyInfo.email} or {companyInfo.phone}</Text>
                                                <Text>Safety Online • Empowering workplace protection across India</Text>
                                        </View>
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
