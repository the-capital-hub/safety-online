import Order from "@/model/Order.js";
import {
        READY_FOR_PICKUP_LABEL,
        READY_FOR_PICKUP_STATUS,
        HEXALOG_STATUS_SLUG_MAP,
        LOGISTICS_STATUS_SET,
        isLogisticsStatus,
        slugifyStatus,
} from "@/constants/orderStatus.js";

export const normalizeHexalogStatus = (status) => {
        const slug = slugifyStatus(status);
        if (!slug) {
                return null;
        }
        if (!isLogisticsStatus(slug)) {
                return null;
        }
        return slug;
};

export async function setOrderReadyForPickup(orderId) {
        if (!orderId) {
                return null;
        }

        const order = await Order.findById(orderId);
        if (!order) {
                return null;
        }

        order.status = READY_FOR_PICKUP_STATUS;
        order.hexalogStatus = READY_FOR_PICKUP_LABEL;
        order.hexalogStatusUpdatedAt = new Date();
        order.hexalogNdrStatus = null;

        await order.save();
        return order;
}

export async function updateOrderStatusFromHexalog({
        orderId,
        rawStatus,
        rawNdrStatus,
} = {}) {
        if (!orderId || !rawStatus) {
                return null;
        }

        const normalizedStatus = normalizeHexalogStatus(rawStatus);
        const order = await Order.findById(orderId);

        if (!order) {
                return null;
        }

        if (normalizedStatus && LOGISTICS_STATUS_SET.has(order.status)) {
                order.status = normalizedStatus;
        }

        if (normalizedStatus && HEXALOG_STATUS_SLUG_MAP[normalizedStatus]) {
                order.hexalogStatus = HEXALOG_STATUS_SLUG_MAP[normalizedStatus];
        } else {
                order.hexalogStatus = rawStatus;
        }
        order.hexalogStatusUpdatedAt = new Date();

        if (rawNdrStatus) {
                order.hexalogNdrStatus = rawNdrStatus;
        }

        await order.save();
        return order;
}
