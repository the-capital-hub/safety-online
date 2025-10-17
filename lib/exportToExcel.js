"use client";

const escapeHtml = (value) =>
        String(value)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");

const formatCellContent = (value) => {
        if (value === null || typeof value === "undefined") {
                return "";
        }

        if (value instanceof Date) {
                return escapeHtml(
                        value.toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                        }),
                );
        }

        if (typeof value === "number") {
                return Number.isFinite(value) ? String(value) : "";
        }

        const stringValue = String(value);
        return escapeHtml(stringValue).replace(/\n/g, "<br />");
};

export async function exportToExcel({ columns = [], rows = [], filename = "export.xls", sheetName = "Sheet1" }) {
        if (typeof window === "undefined" || typeof document === "undefined") {
                console.warn("Excel export is only available in the browser environment");
                return false;
        }

        if (!Array.isArray(rows) || rows.length === 0) {
                console.warn("No rows provided for export");
                return false;
        }

        const normalizedColumns = Array.isArray(columns) && columns.length
                ? columns
                : Object.keys(rows[0]).map((key) => ({ key, header: key }));

        const headerHtml = normalizedColumns
                .map((column) => `<th>${escapeHtml(column.header ?? column.key)}</th>`)
                .join("");

        const bodyHtml = rows
                .map(
                        (row) =>
                                `<tr>${normalizedColumns
                                        .map((column) => `<td>${formatCellContent(row[column.key])}</td>`)
                                        .join("")}</tr>`,
                )
                .join("");

        const tableHtml = `<table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
        const safeSheetName = (sheetName || "Sheet1").toString().slice(0, 31);

        const excelFile = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:x="urn:schemas-microsoft-com:office:excel"
        xmlns="http://www.w3.org/TR/REC-html40">
<head>
        <meta charset="UTF-8" />
        <!--[if gte mso 9]>
        <xml>
                <x:ExcelWorkbook>
                        <x:ExcelWorksheets>
                                <x:ExcelWorksheet>
                                        <x:Name>${escapeHtml(safeSheetName)}</x:Name>
                                        <x:WorksheetOptions>
                                                <x:DisplayGridlines/>
                                        </x:WorksheetOptions>
                                </x:ExcelWorksheet>
                        </x:ExcelWorksheets>
                </x:ExcelWorkbook>
        </xml>
        <![endif]-->
</head>
<body>
        ${tableHtml}
</body>
</html>`;

        try {
                const blob = new Blob([excelFile], { type: "application/vnd.ms-excel" });
                const downloadUrl = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = downloadUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(downloadUrl);
                return true;
        } catch (error) {
                console.error("Failed to export to Excel:", error);
                return false;
        }
}
