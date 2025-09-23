export function normalizeCouponValue(value) {
        if (value === null || value === undefined) {
                return null;
        }

        if (typeof value === "string") {
                const trimmed = value.trim();
                if (!trimmed) {
                        return null;
                }

                return {
                        couponCode: trimmed,
                        code: trimmed,
                };
        }

        if (typeof value !== "object") {
                return null;
        }

        const source =
                typeof value.toObject === "function" ? value.toObject() : { ...value };

        const normalized = {};

        if (source.couponId) {
                normalized.couponId = source.couponId;
        }

        const resolvedCode = source.couponCode ?? source.code ?? source.coupon;
        if (typeof resolvedCode === "string" && resolvedCode.trim()) {
                normalized.couponCode = resolvedCode.trim();
                normalized.code = source.code ?? resolvedCode.trim();
        }

        if (typeof source.name === "string" && source.name.trim()) {
                normalized.name = source.name.trim();
        }

        const resolvedType = source.discountType ?? source.type;
        if (typeof resolvedType === "string" && resolvedType.trim()) {
                normalized.discountType = resolvedType.trim();
        }

        const numericFields = [
                ["discount", "discount"],
                ["discountValue", "discountValue"],
                ["discountAmount", "discountAmount"],
                ["amount", "discountAmount"],
        ];

        for (const [sourceKey, targetKey] of numericFields) {
                if (source[sourceKey] !== undefined && source[sourceKey] !== null) {
                        const numericValue = Number(source[sourceKey]);
                        if (!Number.isNaN(numericValue)) {
                                normalized[targetKey] = numericValue;
                        }
                }
        }

        if (
                normalized.discountAmount === undefined &&
                normalized.discountValue !== undefined
        ) {
                normalized.discountAmount = normalized.discountValue;
        }

        if (
                normalized.discountAmount === undefined &&
                normalized.discount !== undefined
        ) {
                normalized.discountAmount = normalized.discount;
        }

        const passthroughKeys = [
                "maxDiscount",
                "minOrderAmount",
                "description",
                "appliedAt",
        ];

        for (const key of passthroughKeys) {
                if (source[key] !== undefined && source[key] !== null) {
                        normalized[key] = source[key];
                }
        }

        return Object.keys(normalized).length > 0 ? normalized : null;
}
