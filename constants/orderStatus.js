export const READY_FOR_PICKUP_STATUS = "ready_for_pickup";
export const READY_FOR_PICKUP_LABEL = "Ready for Pickup";

export const HEXALOG_STATUS_VALUES = [
        "Order Placed",
        "In Transit",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "Seller Cancelled",
        "RTO Requested",
        "Seller RTO Requested",
        "RTO In Transit",
        "RTO Delivered",
        "RTO Out for Delivery",
        "RTO Failed",
        "Picked Up",
        "Pickup Cancelled",
        "Pickup Pending",
        "Pickup Scheduled",
        "Lost",
        "Damaged",
        "Shipment Delayed",
        "Not Serviceable",
        "Not Picked",
        "Undelivered",
        "Out for Pickup",
        "RTO Shipment Delayed",
];

export const HEXALOG_NDR_STATUS_VALUES = [
        "Unknown Exception",
        "Customer Unavailable",
        "Rejected by Customer",
        "Delivery Rescheduled",
        "Pickup Rescheduled",
        "Customer Unreachable",
        "Address Issue",
        "Payment Issue",
        "Out Of Delivery Area",
        "Order Already Cancelled",
        "Self Collect",
        "Shipment Seized By Customer",
        "Dispute",
        "Maximum Attempt Reached",
        "Not Attempted",
        "OTP Not Received/OTP Mismatch",
        "OTP Verified Cancellation",
        "On Hold",
        "RTO Delivery Failed",
];

export const slugifyStatus = (value) => {
        if (!value && value !== 0) return "";
        return value
                .toString()
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_+|_+$/g, "");
};

const baseOrderStatusLabels = {
        pending: "Pending",
        confirmed: "Confirmed",
        processing: "Processing",
        shipped: "Shipped",
        delivered: "Delivered",
        cancelled: "Cancelled",
        returned: "Returned",
};

export const HEXALOG_STATUS_SLUG_MAP = HEXALOG_STATUS_VALUES.reduce((acc, label) => {
        const slug = slugifyStatus(label);
        if (slug) {
                acc[slug] = label;
        }
        return acc;
}, {});

export const HEXALOG_STATUS_SLUG_LIST = Object.keys(HEXALOG_STATUS_SLUG_MAP);

export const LOGISTICS_STATUS_SET = new Set([
        ...HEXALOG_STATUS_SLUG_LIST,
        READY_FOR_PICKUP_STATUS,
]);

export const ORDER_STATUS_LABELS = {
        ...baseOrderStatusLabels,
        [READY_FOR_PICKUP_STATUS]: READY_FOR_PICKUP_LABEL,
        ...HEXALOG_STATUS_SLUG_MAP,
};

export const ORDER_STATUS_BADGE_COLORS = {
        pending: "bg-yellow-100 text-yellow-800",
        confirmed: "bg-blue-100 text-blue-800",
        processing: "bg-purple-100 text-purple-800",
        shipped: "bg-indigo-100 text-indigo-800",
        delivered: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
        returned: "bg-gray-100 text-gray-800",
        [READY_FOR_PICKUP_STATUS]: "bg-blue-100 text-blue-800",
        order_placed: "bg-indigo-100 text-indigo-800",
        picked_up: "bg-indigo-100 text-indigo-800",
        out_for_pickup: "bg-indigo-100 text-indigo-800",
        in_transit: "bg-blue-100 text-blue-800",
        out_for_delivery: "bg-emerald-100 text-emerald-800",
        undelivered: "bg-orange-100 text-orange-800",
        shipment_delayed: "bg-yellow-100 text-yellow-800",
        not_picked: "bg-yellow-100 text-yellow-800",
        not_serviceable: "bg-red-100 text-red-800",
        lost: "bg-red-100 text-red-800",
        damaged: "bg-red-100 text-red-800",
        seller_cancelled: "bg-red-100 text-red-800",
        rto_requested: "bg-orange-100 text-orange-800",
        seller_rto_requested: "bg-orange-100 text-orange-800",
        rto_in_transit: "bg-orange-100 text-orange-800",
        rto_out_for_delivery: "bg-orange-100 text-orange-800",
        rto_failed: "bg-red-100 text-red-800",
        rto_delivered: "bg-gray-100 text-gray-800",
        rto_shipment_delayed: "bg-orange-100 text-orange-800",
        pickup_pending: "bg-blue-100 text-blue-800",
        pickup_scheduled: "bg-blue-100 text-blue-800",
        pickup_cancelled: "bg-red-100 text-red-800",
};

const orderStatusDisplayOrder = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
        READY_FOR_PICKUP_STATUS,
        "order_placed",
        "picked_up",
        "out_for_pickup",
        "in_transit",
        "out_for_delivery",
        "undelivered",
        "shipment_delayed",
        "not_picked",
        "not_serviceable",
        "lost",
        "damaged",
        "seller_cancelled",
        "rto_requested",
        "seller_rto_requested",
        "rto_in_transit",
        "rto_out_for_delivery",
        "rto_failed",
        "rto_delivered",
        "rto_shipment_delayed",
        "pickup_pending",
        "pickup_scheduled",
        "pickup_cancelled",
];

export const ORDER_STATUS_OPTIONS = orderStatusDisplayOrder
        .filter((status, index, array) => array.indexOf(status) === index)
        .filter((status) => ORDER_STATUS_LABELS[status])
        .map((status) => ({
                value: status,
                label: ORDER_STATUS_LABELS[status],
        }));

export const ORDER_STATUS_UPDATE_OPTIONS = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        READY_FOR_PICKUP_STATUS,
        "cancelled",
        "returned",
];

export const ORDER_STATUS_ENUM = Object.keys(ORDER_STATUS_LABELS);
export const HEXALOG_STATUS_ENUM = [...HEXALOG_STATUS_VALUES, READY_FOR_PICKUP_LABEL];
export const HEXALOG_NDR_STATUS_ENUM = [...HEXALOG_NDR_STATUS_VALUES];

export const getOrderStatusLabel = (status) => {
        if (!status) {
                        return "Unknown";
        }
        if (ORDER_STATUS_LABELS[status]) {
                return ORDER_STATUS_LABELS[status];
        }
        return status
                .toString()
                .replace(/_/g, " ")
                .split(" ")
                .filter(Boolean)
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
};

export const getOrderStatusBadgeColor = (status) =>
        ORDER_STATUS_BADGE_COLORS[status] || "bg-gray-100 text-gray-800";

export const getOrderDisplayStatus = (order) => {
        if (!order) {
                return "Unknown";
        }
        const status = order.status;
        if (status && LOGISTICS_STATUS_SET.has(status) && order.hexalogStatus) {
                return order.hexalogStatus;
        }
        return getOrderStatusLabel(status);
};

export const isLogisticsStatus = (status) => LOGISTICS_STATUS_SET.has(status);
