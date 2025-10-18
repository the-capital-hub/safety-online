export const GST_RATE_PERCENT = 18;

const roundToTwo = (value) => {
        const numeric = Number(value || 0);
        if (!Number.isFinite(numeric)) {
                return 0;
        }
	return Math.round(numeric * 100) / 100;
};

const formatRate = (value) => {
	const numeric = Number(value);
	if (!Number.isFinite(numeric)) {
		return "0";
	}
	const fixed = numeric.toFixed(2);
	return fixed.replace(/\.00$/, "").replace(/(\.[0-9]*[1-9])0+$/, "$1");
};

const matchesKarnataka = (value) => {
        if (!value) return false;

        const normalized = String(value).trim().toLowerCase();
        if (!normalized) {
                return false;
        }

        if (normalized.includes("karnataka")) {
                return true;
        }

        const letters = normalized.replace(/[^a-z]/g, "");
        if (letters === "ka") {
                return true;
        }

        const digits = normalized.replace(/[^0-9]/g, "");
        if (digits === "29") {
                return true;
        }

        return false;
};

const isKarnatakaAddress = (address) => {
        if (!address) return false;

        if (typeof address === "string") {
                return matchesKarnataka(address);
        }

        const fieldsToCheck = [
                address.state,
                address.gstState,
                address.stateCode,
                address.state_code,
                address.stateName,
                address.state_name,
                address.fullAddress,
                address.address,
        ];

        return fieldsToCheck.some((field) => matchesKarnataka(field));
};

export const determineGstMode = (address) => {
        if (!address) return "igst";

        if (isKarnatakaAddress(address)) {
                return "cgst_sgst";
        }

        return "igst";
};

export const calculateGstTotals = ({
	subtotal = 0,
	discount = 0,
	shippingCost = 0,
	address = null,
	gstMode = null,
	gstRatePercent = GST_RATE_PERCENT,
} = {}) => {
	const safeSubtotal = roundToTwo(subtotal);
	const safeDiscount = Math.min(roundToTwo(discount), safeSubtotal);
	const safeShipping = roundToTwo(shippingCost);

	// Taxable Amount = Subtotal + Shipping - Discount
	const taxableAmount = roundToTwo(
		Math.max(safeSubtotal + safeShipping - safeDiscount, 0)
	);

	const mode = gstMode || determineGstMode(address);
	const rate = Number.isFinite(Number(gstRatePercent))
		? Number(gstRatePercent)
		: GST_RATE_PERCENT;

	// GST = 18% of Taxable Amount
	const gstTotal = roundToTwo(taxableAmount * (rate / 100));

	let cgst = 0;
	let sgst = 0;
	let igst = 0;

	if (mode === "cgst_sgst") {
		const half = roundToTwo(gstTotal / 2);
		cgst = half;
		sgst = roundToTwo(gstTotal - half);
	} else {
		igst = gstTotal;
	}

	// Total = Taxable Amount + GST
	const grandTotal = roundToTwo(taxableAmount + gstTotal);

	return {
		subtotal: safeSubtotal,
		discount: safeDiscount,
		shippingCost: safeShipping,
		taxableAmount,
		gst: {
			mode,
			rate,
			cgst,
			sgst,
			igst,
			total: gstTotal,
			taxableAmount,
		},
		total: grandTotal,
	};
};

export const buildGstLineItems = (gst) => {
	if (!gst) return [];

	const { mode = "igst", rate = GST_RATE_PERCENT } = gst;
	const lines = [];

	if (mode === "cgst_sgst") {
		const halfRate = rate / 2;
		const cgstAmount = roundToTwo(gst.cgst ?? (gst.total ?? 0) / 2);
		const sgstAmount = roundToTwo(gst.sgst ?? (gst.total ?? 0) / 2);

		if (cgstAmount > 0) {
			lines.push({
				key: "cgst",
				label: `CGST (${formatRate(halfRate)}%)`,
				amount: cgstAmount,
			});
		}
		if (sgstAmount > 0) {
			lines.push({
				key: "sgst",
				label: `SGST (${formatRate(halfRate)}%)`,
				amount: sgstAmount,
			});
		}
	} else {
		const igstAmount = roundToTwo(gst.igst ?? gst.total ?? 0);
		if (igstAmount > 0) {
			lines.push({
				key: "igst",
				label: `IGST (${formatRate(rate)}%)`,
				amount: igstAmount,
			});
		}
	}

	return lines;
};

export default {
	GST_RATE_PERCENT,
	determineGstMode,
	calculateGstTotals,
	buildGstLineItems,
};
