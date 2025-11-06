export const INVOICE_TYPE_FILTER_OPTIONS = [
        { value: "all", label: "All invoice types" },
        { value: "business", label: "Business invoices" },
        { value: "standard", label: "Standard invoices" },
];

export const normalizeInvoiceTypeFilter = (value) => {
        if (value === "business" || value === "standard") {
                return value;
        }
        return "all";
};

export const getInvoiceTypeLabel = (value) => {
        const normalized = normalizeInvoiceTypeFilter(value);
        const option = INVOICE_TYPE_FILTER_OPTIONS.find((item) => item.value === normalized);
        return option ? option.label : "All invoice types";
};
