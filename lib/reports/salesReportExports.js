import jsPDF from "jspdf";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
});

const sanitizeNumber = (value) => {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : 0;
};

const formatCurrency = (value) => currencyFormatter.format(sanitizeNumber(value));

const formatDate = (value) => {
        if (!value) return "—";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
                return "—";
        }
        return date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
        });
};

const formatDateTime = (value) => {
        if (!value) return "—";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
                return "—";
        }
        return date.toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
        });
};

const escapeHtml = (value) =>
        String(value)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");

const buildHtmlTable = (headers, rows) => {
        const headRow = headers
                .map((header) => `<th style="text-align:left;padding:4px;border:1px solid #ddd;">${escapeHtml(header)}</th>`)
                .join("");
        const bodyRows = rows
                .map((row) => {
                        const cells = row
                                .map((cell) => `<td style="padding:4px;border:1px solid #ddd;vertical-align:top;">${escapeHtml(cell)}</td>`)
                                .join("");
                        return `<tr>${cells}</tr>`;
                })
                .join("");
        return `<table style="border-collapse:collapse;margin-bottom:16px;width:100%;"><thead><tr style="background:#f3f4f6;">${headRow}</tr></thead><tbody>${bodyRows}</tbody></table>`;
};

const summariseProducts = (products = []) =>
        products
                .map((product) => {
                        const name = product?.name || "Product";
                        const quantity = sanitizeNumber(product?.quantity || 0);
                        const total = formatCurrency(product?.total ?? product?.price ?? 0);
                        return `${name} (Qty: ${quantity}, Total: ${total})`;
                })
                .join("; ");

const ensureValue = (value) => {
        if (value === null || value === undefined || value === "") {
                return "—";
        }
        return String(value);
};

const buildFileName = (prefix) => {
        const now = new Date();
        const pad = (input) => String(input).padStart(2, "0");
        const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
        const timePart = `${pad(now.getHours())}${pad(now.getMinutes())}`;
        return `${prefix}-${datePart}-${timePart}`;
};

export const downloadSalesReportExcel = (report, filters = {}) => {
        if (typeof window === "undefined") {
                return;
        }
        const generatedAt = new Date();
        const summaryRows = [
                ["Metric", "Value"],
                ["Total revenue", formatCurrency(report?.summary?.totalRevenue)],
                ["Total orders", ensureValue(report?.summary?.totalOrders ?? 0)],
                ["Units sold", ensureValue(report?.summary?.totalUnits ?? 0)],
                ["Average order value", formatCurrency(report?.summary?.averageOrderValue)],
        ];

        const sellerRowsData = (report?.sellerSummary || []).map((seller) => [
                ensureValue(
                        seller.sellerName?.trim() || seller.sellerEmail || seller.sellerPhone || seller.sellerId || "—"
                ),
                ensureValue(seller.sellerEmail || seller.sellerPhone || ""),
                ensureValue(seller.sellerStatus || ""),
                ensureValue(seller.orderCount ?? 0),
                ensureValue(seller.totalUnits ?? 0),
                formatCurrency(seller.totalRevenue),
                formatCurrency(seller.averageOrderValue),
        ]);
        const sellerRows = [
                ["Seller", "Contact", "Status", "Total orders", "Units", "Revenue", "Avg. order value"],
                ...(sellerRowsData.length ? sellerRowsData : [["No seller data", "", "", "", "", "", ""]]),
        ];

        const orderRowsData = (report?.orders || []).map((order) => [
                ensureValue(order.orderNumber || order.id || "—"),
                formatDate(order.orderDate),
                ensureValue(order.customer?.name || "—"),
                ensureValue(order.customer?.email || order.customer?.phone || ""),
                ensureValue(order.seller?.name || order.seller?.email || "—"),
                ensureValue(order.seller?.email || order.seller?.phone || ""),
                ensureValue(order.unitCount ?? 0),
                formatCurrency(order.invoiceValue),
                ensureValue(order.paymentMethod === "unknown" ? "Unknown" : order.paymentMethod || "—"),
                ensureValue(order.status || "—"),
                ensureValue(summariseProducts(order.products)),
        ]);

        const orderRows = [
                [
                        "Order",
                        "Order date",
                        "Customer",
                        "Customer contact",
                        "Seller",
                        "Seller contact",
                        "Units",
                        "Invoice value",
                        "Payment method",
                        "Status",
                        "Products",
                ],
                ...(orderRowsData.length ? orderRowsData : [["No order data", "", "", "", "", "", "", "", "", "", ""]]),
        ];

        const filterRows = [
                ["Filter", "Value"],
                ["Start date", formatDate(filters.startDate)],
                ["End date", formatDate(filters.endDate)],
                ["Statuses", ensureValue((filters.statuses || []).join(", ") || "All")],
                ["Payment methods", ensureValue((filters.paymentMethods || []).join(", ") || "All")],
                ["Sellers", ensureValue((filters.sellers || []).join(", ") || "All")],
                ["Search", ensureValue(filters.search || "—")],
                ["Generated", formatDateTime(generatedAt)],
        ];

        const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>Sales report</title></head><body>`
                + `<h2 style="font-family:Arial,Helvetica,sans-serif;">Summary</h2>${buildHtmlTable(
                        summaryRows[0],
                        summaryRows.slice(1)
                )}`
                + `<h2 style="font-family:Arial,Helvetica,sans-serif;">Seller performance</h2>${buildHtmlTable(
                        sellerRows[0],
                        sellerRows.slice(1)
                )}`
                + `<h2 style="font-family:Arial,Helvetica,sans-serif;">Orders</h2>${buildHtmlTable(
                        orderRows[0],
                        orderRows.slice(1)
                )}`
                + `<h2 style="font-family:Arial,Helvetica,sans-serif;">Applied filters</h2>${buildHtmlTable(
                        filterRows[0],
                        filterRows.slice(1)
                )}`
                + `</body></html>`;

        const blob = new Blob([html], {
                type: "application/vnd.ms-excel;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${buildFileName("sales-report")}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
};

const ensurePageSpace = (doc, currentY, minimumSpace = 20) => {
        const pageHeight = doc.internal.pageSize.getHeight();
        if (currentY + minimumSpace <= pageHeight - 14) {
                return currentY;
        }
        doc.addPage();
        return 20;
};

const appendLines = (doc, lines, startY, options = {}) => {
        const { maxWidth, lineHeight = 6 } = options;
        let y = startY;
        lines.forEach((line) => {
                const textLines = maxWidth ? doc.splitTextToSize(line, maxWidth) : [line];
                textLines.forEach((textLine) => {
                        doc.text(textLine, 20, y);
                        y += lineHeight;
                });
        });
        return y;
};

export const downloadSalesReportPdf = (report, filters = {}) => {
        if (typeof window === "undefined") {
                return;
        }
        const generatedAt = new Date();
        const doc = new jsPDF({ orientation: "landscape" });
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 20;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("Sales report", 20, y);

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        y += 8;
        const filterSummary = [
                `Start date: ${formatDate(filters.startDate)}`,
                `End date: ${formatDate(filters.endDate)}`,
                `Generated: ${formatDateTime(generatedAt)}`,
        ];
        y = appendLines(doc, filterSummary, y, { lineHeight: 6 });
        y += 2;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Summary", 20, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        y += 8;
        const summaryLines = [
                `Total revenue: ${formatCurrency(report?.summary?.totalRevenue)}`,
                `Total orders: ${ensureValue(report?.summary?.totalOrders ?? 0)}`,
                `Units sold: ${ensureValue(report?.summary?.totalUnits ?? 0)}`,
                `Average order value: ${formatCurrency(report?.summary?.averageOrderValue)}`,
        ];
        y = appendLines(doc, summaryLines, y, { lineHeight: 6 });
        y += 4;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Seller performance", 20, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        y += 7;

        if ((report?.sellerSummary || []).length === 0) {
                y = appendLines(doc, ["No seller performance data."], y, {
                        lineHeight: 6,
                        maxWidth: pageWidth - 40,
                });
                y += 4;
        } else {
                report.sellerSummary.forEach((seller) => {
                        y = ensurePageSpace(doc, y, 24);
                        const sellerLines = [
                                `${seller.sellerName?.trim() || seller.sellerEmail || seller.sellerPhone || seller.sellerId || "Seller"}`,
                                `Orders: ${ensureValue(seller.orderCount ?? 0)}, Units: ${ensureValue(seller.totalUnits ?? 0)}, Revenue: ${formatCurrency(
                                        seller.totalRevenue
                                )}, Avg order value: ${formatCurrency(seller.averageOrderValue)}`,
                        ];
                        if (seller.sellerEmail || seller.sellerPhone || seller.sellerStatus) {
                                const details = [seller.sellerEmail, seller.sellerPhone, seller.sellerStatus]
                                        .filter(Boolean)
                                        .join(" • ");
                                sellerLines.push(details);
                        }
                        y = appendLines(doc, sellerLines, y, {
                                lineHeight: 6,
                                maxWidth: pageWidth - 40,
                        });
                        y += 4;
                });
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        y = ensurePageSpace(doc, y, 28);
        doc.text("Orders", 20, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        y += 7;

        if ((report?.orders || []).length === 0) {
                appendLines(doc, ["No order data for the selected filters."], y, {
                        lineHeight: 6,
                        maxWidth: pageWidth - 40,
                });
        } else {
                report.orders.forEach((order, index) => {
                        y = ensurePageSpace(doc, y, 36);
                        const headerLine = `${index + 1}. Order ${ensureValue(order.orderNumber || order.id || "—")} • ${formatDate(
                                order.orderDate
                        )}`;
                        const customerLine = `Customer: ${ensureValue(order.customer?.name || "—")} (${ensureValue(
                                order.customer?.email || order.customer?.phone || "—"
                        )})`;
                        const sellerLine = `Seller: ${ensureValue(order.seller?.name || order.seller?.email || "—")} (${ensureValue(
                                order.seller?.email || order.seller?.phone || "—"
                        )})`;
                        const invoiceLine = `Units: ${ensureValue(order.unitCount ?? 0)} • Invoice value: ${formatCurrency(
                                order.invoiceValue
                        )} • Payment: ${ensureValue(order.paymentMethod === "unknown" ? "Unknown" : order.paymentMethod || "—")}`;
                        const statusLine = `Status: ${ensureValue(order.status || "—")}`;
                        const productSummary = summariseProducts(order.products);
                        const lines = [headerLine, customerLine, sellerLine, invoiceLine, statusLine];
                        if (productSummary) {
                                lines.push(`Products: ${productSummary}`);
                        }
                        y = appendLines(doc, lines, y, {
                                lineHeight: 6,
                                maxWidth: pageWidth - 40,
                        });
                        y += 4;
                });
        }

        doc.save(`${buildFileName("sales-report")}.pdf`);
};
