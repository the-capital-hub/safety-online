// Utilities to compute shipping package dimensions/weight with simple cartonization

// Predefined carton sizes in centimeters and max weight in grams
const CARTONS = [
	{ code: "S", length: 20, width: 15, height: 10, maxWeight: 2000 },
	{ code: "M", length: 30, width: 22, height: 15, maxWeight: 4000 },
	{ code: "L", length: 40, width: 30, height: 20, maxWeight: 8000 },
	{ code: "XL", length: 50, width: 40, height: 30, maxWeight: 15000 },
];

function safeNumber(value, fallback = 0) {
	const n = Number(value);
	return Number.isFinite(n) ? n : fallback;
}

function volumeCm3({ length, width, height }) {
	return safeNumber(length) * safeNumber(width) * safeNumber(height);
}

export function pickCartonByVolumeWeight(totalVolumeCm3, totalWeightGrams) {
	// Heuristic: translate volume to an equivalent cube and pick smallest carton that fits
	for (const carton of CARTONS) {
		const cartonVolume = volumeCm3(carton);
		if (
			totalVolumeCm3 <= cartonVolume &&
			totalWeightGrams <= carton.maxWeight
		) {
			return carton;
		}
	}
	// If exceeds XL, fall back to an oversized carton using weight/volume-derived dims
	const side = Math.cbrt(Math.max(totalVolumeCm3, 1));
	return {
		code: "OVERSIZE",
		length: Math.ceil(side),
		width: Math.ceil(side),
		height: Math.ceil(side),
		maxWeight: Math.max(totalWeightGrams, 15000),
	};
}

// items: [{ length, width, height, weight, quantity }]
export function computePackageDimensions(items = []) {
	const normalized = items.filter(Boolean).map((it) => ({
		length: safeNumber(it.length, 10),
		width: safeNumber(it.width, 10),
		height: safeNumber(it.height, 5),
		weight: safeNumber(it.weight, 250), // default 250g
		quantity: Math.max(1, safeNumber(it.quantity, 1)),
	}));

	if (normalized.length === 0) {
		return { length: 20, width: 15, height: 10, weight: 500, carton: "S" };
	}

	if (normalized.length === 1 && normalized[0].quantity === 1) {
		const only = normalized[0];
		return {
			length: Math.ceil(only.length),
			width: Math.ceil(only.width),
			height: Math.ceil(only.height),
			weight: Math.ceil(only.weight),
			carton: null,
		};
	}

	// Multiple items: approximate cartonization by summing volume/weight
	let totalVolume = 0;
	let totalWeight = 0;
	for (const it of normalized) {
		const itemVolume = volumeCm3(it);
		totalVolume += itemVolume * it.quantity;
		totalWeight += it.weight * it.quantity;
	}

	const carton = pickCartonByVolumeWeight(totalVolume, totalWeight);
	return {
		length: carton.length,
		width: carton.width,
		height: carton.height,
		weight: Math.ceil(totalWeight),
		carton: carton.code,
	};
}

export const cartons = CARTONS;
