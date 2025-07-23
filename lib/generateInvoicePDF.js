import {
	Document,
	Page,
	Text,
	View,
	StyleSheet,
	pdf,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
	page: {
		flexDirection: "column",
		backgroundColor: "#FFFFFF",
		padding: 30,
		fontSize: 12,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 20,
		borderBottom: 1,
		borderBottomColor: "#E5E5E5",
		paddingBottom: 20,
	},
	companyInfo: {
		flexDirection: "column",
	},
	companyName: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#F97316",
		marginBottom: 5,
	},
	invoiceInfo: {
		flexDirection: "column",
		alignItems: "flex-end",
	},
	invoiceTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 10,
	},
	section: {
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 14,
		fontWeight: "bold",
		marginBottom: 10,
		color: "#374151",
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 5,
	},
	table: {
		display: "table",
		width: "auto",
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "#E5E5E5",
		marginBottom: 20,
	},
	tableRow: {
		margin: "auto",
		flexDirection: "row",
	},
	tableHeader: {
		backgroundColor: "#F3F4F6",
		fontWeight: "bold",
	},
	tableCol: {
		width: "20%",
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "#E5E5E5",
		padding: 8,
	},
	tableCell: {
		fontSize: 10,
	},
	totalSection: {
		marginTop: 20,
		paddingTop: 20,
		borderTop: 1,
		borderTopColor: "#E5E5E5",
	},
	totalRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 5,
	},
	grandTotal: {
		fontSize: 14,
		fontWeight: "bold",
		borderTop: 1,
		borderTopColor: "#374151",
		paddingTop: 10,
		marginTop: 10,
	},
	footer: {
		marginTop: 30,
		paddingTop: 20,
		borderTop: 1,
		borderTopColor: "#E5E5E5",
		fontSize: 10,
		color: "#6B7280",
	},
});

const InvoiceDocument = ({ order }) => (
	<Document>
		<Page size="A4" style={styles.page}>
			{/* Header */}
			<View style={styles.header}>
				<View style={styles.companyInfo}>
					<Text style={styles.companyName}>SAFETY</Text>
					<Text>www.website.com</Text>
					<Text>hello@gmail.com</Text>
					<Text>+00 00000 00000</Text>
				</View>
				<View style={styles.invoiceInfo}>
					<Text style={styles.invoiceTitle}>INVOICE</Text>
					<Text>Invoice #: {order.orderNumber}</Text>
					<Text>Date: {new Date(order.orderDate).toLocaleDateString()}</Text>
					<Text>Status: {order.status.toUpperCase()}</Text>
				</View>
			</View>

			{/* Customer Information */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Bill To:</Text>
				<Text>{order.customerName}</Text>
				<Text>{order.customerEmail}</Text>
				<Text>{order.customerMobile}</Text>
				{order.deliveryAddress && (
					<Text>{order.deliveryAddress.fullAddress}</Text>
				)}
			</View>

			{/* Order Details */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Order Details:</Text>
				<View style={styles.row}>
					<Text>
						Order Date: {new Date(order.orderDate).toLocaleDateString()}
					</Text>
					<Text>
						Payment Method:{" "}
						{order.paymentMethod.replace("_", " ").toUpperCase()}
					</Text>
				</View>
				<View style={styles.row}>
					<Text>Payment Status: {order.paymentStatus.toUpperCase()}</Text>
					<Text>Order Status: {order.status.toUpperCase()}</Text>
				</View>
			</View>

			{/* Products Table */}
			<View style={styles.table}>
				<View style={[styles.tableRow, styles.tableHeader]}>
					<View style={styles.tableCol}>
						<Text style={styles.tableCell}>Product</Text>
					</View>
					<View style={styles.tableCol}>
						<Text style={styles.tableCell}>Quantity</Text>
					</View>
					<View style={styles.tableCol}>
						<Text style={styles.tableCell}>Price</Text>
					</View>
					<View style={styles.tableCol}>
						<Text style={styles.tableCell}>Total</Text>
					</View>
				</View>
				{order.products.map((product, index) => (
					<View style={styles.tableRow} key={index}>
						<View style={styles.tableCol}>
							<Text style={styles.tableCell}>{product.productName}</Text>
						</View>
						<View style={styles.tableCol}>
							<Text style={styles.tableCell}>{product.quantity}</Text>
						</View>
						<View style={styles.tableCol}>
							<Text style={styles.tableCell}>${product.price.toFixed(2)}</Text>
						</View>
						<View style={styles.tableCol}>
							<Text style={styles.tableCell}>
								${product.totalPrice.toFixed(2)}
							</Text>
						</View>
					</View>
				))}
			</View>

			{/* Totals */}
			<View style={styles.totalSection}>
				<View style={styles.totalRow}>
					<Text>Subtotal:</Text>
					<Text>${order.subtotal.toFixed(2)}</Text>
				</View>
				{order.tax > 0 && (
					<View style={styles.totalRow}>
						<Text>Tax:</Text>
						<Text>${order.tax.toFixed(2)}</Text>
					</View>
				)}
				{order.shippingCost > 0 && (
					<View style={styles.totalRow}>
						<Text>Shipping:</Text>
						<Text>${order.shippingCost.toFixed(2)}</Text>
					</View>
				)}
				{order.discount > 0 && (
					<View style={styles.totalRow}>
						<Text>Discount:</Text>
						<Text>-${order.discount.toFixed(2)}</Text>
					</View>
				)}
				<View style={[styles.totalRow, styles.grandTotal]}>
					<Text>Total Amount:</Text>
					<Text>${order.totalAmount.toFixed(2)}</Text>
				</View>
			</View>

			{/* Footer */}
			<View style={styles.footer}>
				<Text>Thank you for your business!</Text>
				<Text>For any queries, please contact us at hello@gmail.com</Text>
			</View>
		</Page>
	</Document>
);

export const generateInvoicePDF = async (order) => {
	const doc = <InvoiceDocument order={order} />;
	const pdfBuffer = await pdf(doc).toBuffer();
	return pdfBuffer;
};

export default InvoiceDocument;
