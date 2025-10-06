// Dynamic Shipping Calculator - Integrates with checkout flow
import { computePackageDimensions } from "./packaging.js";

/**
 * Calculate shipping parameters from order items
 * @param {Array} orderItems - Array of order items from checkout
 * @param {Object} options - Additional options
 * @param {String} options.pickupPincode - Seller's pickup pincode
 * @param {String} options.dropPincode - Customer's delivery pincode
 * @param {String} options.paymentType - 'Prepaid' or 'COD'
 * @returns {Object} Complete shipping parameters for estimate API
 */
export function calculateShippingParams(orderItems = [], options = {}) {
	if (!Array.isArray(orderItems) || orderItems.length === 0) {
		throw new Error("Order items are required");
	}

	// Transform order items to packaging format
	const packagingItems = orderItems.map((item) => ({
		// Try to get dimensions from product, fallback to defaults
		length: item.length || item.dimensions?.length || 15,
		width: item.width || item.dimensions?.width || 12,
		height: item.height || item.dimensions?.height || 8,
		// Weight in grams
		weight: item.weight || item.weightGrams || 300,
		quantity: item.quantity || 1,
	}));

	// Use packaging utility to compute optimal package dimensions
	const packageDetails = computePackageDimensions(packagingItems);

	// Calculate invoice amount (subtotal of all items)
	const invoiceAmount = orderItems.reduce((sum, item) => {
		return sum + (item.totalPrice || item.price * item.quantity || 0);
	}, 0);

	// Build complete shipping parameters
	return {
		pickupPincode: options.pickupPincode || "560068", // Default seller pincode
		dropPincode: options.dropPincode,
		length: packageDetails.length,
		width: packageDetails.width,
		height: packageDetails.height,
		weight: packageDetails.weight,
		paymentType: options.paymentType || "Prepaid",
		invoiceAmount: Math.round(invoiceAmount * 100) / 100, // Round to 2 decimals
		cartonType: packageDetails.carton,
	};
}

/**
 * Validate shipping parameters before API call
 * @param {Object} params - Shipping parameters
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export function validateShippingParams(params) {
	const errors = [];

	if (!params.pickupPincode || !/^\d{6}$/.test(String(params.pickupPincode))) {
		errors.push("Valid 6-digit pickup pincode is required");
	}

	if (!params.dropPincode || !/^\d{6}$/.test(String(params.dropPincode))) {
		errors.push("Valid 6-digit delivery pincode is required");
	}

	if (!params.length || params.length <= 0) {
		errors.push("Package length must be greater than 0");
	}

	if (!params.width || params.width <= 0) {
		errors.push("Package width must be greater than 0");
	}

	if (!params.height || params.height <= 0) {
		errors.push("Package height must be greater than 0");
	}

	if (!params.weight || params.weight <= 0) {
		errors.push("Package weight must be greater than 0");
	}

	if (!["Prepaid", "COD"].includes(params.paymentType)) {
		errors.push("Payment type must be 'Prepaid' or 'COD'");
	}

	if (!params.invoiceAmount || params.invoiceAmount <= 0) {
		errors.push("Invoice amount must be greater than 0");
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}

/**
 * Get shipping estimate with automatic parameter calculation
 * @param {Array} orderItems - Order items
 * @param {Object} options - Shipping options
 * @returns {Promise<Object>} Shipping estimate
 */
export async function getAutoShippingEstimate(orderItems, options = {}) {
	try {
		// Calculate shipping parameters dynamically
		const params = calculateShippingParams(orderItems, options);

		// Validate parameters
		const validation = validateShippingParams(params);
		if (!validation.isValid) {
			throw new Error(
				`Invalid shipping parameters: ${validation.errors.join(", ")}`
			);
		}

		// Make API call (this should be imported from your API utility)
		const response = await fetch("/api/hexalog/shipping-estimate", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(params),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Failed to get shipping estimate");
		}

		const estimate = await response.json();

		return {
			...estimate,
			packageDetails: {
				length: params.length,
				width: params.width,
				height: params.height,
				weight: params.weight,
				cartonType: params.cartonType,
			},
		};
	} catch (error) {
		console.error("Auto shipping estimate error:", error);
		throw error;
	}
}

// Export for use in checkout store
export default {
	calculateShippingParams,
	validateShippingParams,
	getAutoShippingEstimate,
};
