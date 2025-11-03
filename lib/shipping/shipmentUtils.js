// import { createHexalogShipment, getShippingEstimate } from "@/lib/hexalog.js";
// import {
// 	logShipmentCreation,
// 	logShipmentError,
// } from "@/lib/reports/shipmentLogger.js";
// import Company from "@/model/companyDetails.js";
// import { computePackageDimensions } from "./packaging.js";

// /**
//  * Calculate package dimensions and weight based on products
//  * @param {Array} products - Array of product objects
//  * @returns {Object} Package details
//  */

// // export function calculatePackageDetails(products) {
// // 	if (!Array.isArray(products) || products.length === 0) {
// // 		throw new Error("Products array is required");
// // 	}

// // 	// Default package dimensions (in cm)
// // 	const defaultDimensions = {
// // 		length: 25,
// // 		width: 20,
// // 		height: 15,
// // 		weight: 500, // grams
// // 	};

// // 	// Calculate total weight and adjust dimensions based on quantity
// // 	const totalQuantity = products.reduce(
// // 		(sum, product) => sum + (product.quantity || 1),
// // 		0
// // 	);
// // 	const baseWeight = defaultDimensions.weight;
// // 	const totalWeight = Math.max(
// // 		baseWeight,
// // 		baseWeight * Math.ceil(totalQuantity / 2)
// // 	);

// // 	// Adjust dimensions based on quantity
// // 	const dimensionMultiplier = Math.ceil(totalQuantity / 3);
// // 	const length = Math.min(defaultDimensions.length * dimensionMultiplier, 60);
// // 	const width = Math.min(defaultDimensions.width * dimensionMultiplier, 50);
// // 	const height = Math.min(defaultDimensions.height * dimensionMultiplier, 40);

// // 	// Calculate volumetric weight (length × width × height / 5000 for air freight)
// // 	const volumetricWeight = Math.ceil((length * width * height) / 5000);
// // 	const chargeableWeight = Math.max(totalWeight, volumetricWeight);

// // 	// Determine box type based on dimensions
// // 	let boxType = "S";
// // 	if (chargeableWeight > 2000 || length > 40) boxType = "L";
// // 	else if (chargeableWeight > 1000 || length > 30) boxType = "M";

// // 	return {
// // 		length,
// // 		width,
// // 		height,
// // 		actualWeight: totalWeight,
// // 		volumetricWeight,
// // 		chargeableWeight,
// // 		boxType,
// // 		packageValue: products.reduce(
// // 			(sum, product) => sum + (product.totalPrice || 0),
// // 			0
// // 		),
// // 	};
// // }

// /**
//  * Calculate accurate package dimensions and weight
//  * using cartonization logic from packaging.js
//  *
//  * @param {Array} products - Array of product objects
//  * @returns {Object} Package details
//  */
// export function calculatePackageDetails(products = []) {
// 	if (!Array.isArray(products) || products.length === 0) {
// 		throw new Error("Products array is required");
// 	}

// 	// console.log(
// 	// 	`Calculating package details for ${products.length} products`,
// 	// 	products
// 	// );

// 	// Map products to the structure expected by computePackageDimensions
// 	const items = products.map((p) => ({
// 		length: p.length || p.dimensions?.length || 10, // fallback if missing
// 		width: p.width || p.dimensions?.width || 10,
// 		height: p.height || p.dimensions?.height || 5,
// 		weight: p.weight ? p.weight * 1000 : 250,
// 		quantity: p.quantity || 1,
// 	}));

// 	// Compute optimized carton dimensions
// 	const base = computePackageDimensions(items);

// 	// Calculate volumetric weight (industry standard divisor = 5000)
// 	const volumetricWeight = Math.ceil(
// 		(base.length * base.width * base.height) / 5000
// 	);

// 	// Pick whichever is higher for billing (chargeable)
// 	const chargeableWeight = Math.max(base.weight, volumetricWeight);

// 	// Compute total package value
// 	const packageValue = products.reduce(
// 		(sum, p) => sum + (p.totalPrice || 0),
// 		0
// 	);

// 	return {
// 		length: base.length,
// 		width: base.width,
// 		height: base.height,
// 		actualWeight: base.weight,
// 		volumetricWeight,
// 		chargeableWeight,
// 		boxType: base.carton || "S",
// 		packageValue,
// 	};
// }

// /**
//  * Get seller's company details for pickup address
//  * @param {String} sellerId - Seller's user ID
//  * @returns {Object} Company details or null
//  */
// async function getSellerCompanyDetails(sellerId) {
// 	try {
// 		const company = await Company.findOne({ user: sellerId }).lean();
// 		return company;
// 	} catch (error) {
// 		console.error(
// 			`Error fetching company details for seller ${sellerId}:`,
// 			error
// 		);
// 		return null;
// 	}
// }

// /**
//  * Format pickup address from company details
//  * @param {Object} company - Company details
//  * @returns {Object} Formatted pickup address
//  */
// function formatPickupAddress(company) {
// 	if (!company) {
// 		throw new Error("Company details not found for seller");
// 	}

// 	// Prefer stored primary pickup address, then "head office" tag, then first available
// 	const primaryAddress =
// 		company.primaryPickupAddress ||
// 		company.companyAddress?.find(
// 			(addr) => addr.tagName?.toLowerCase() === "head office"
// 		) ||
// 		company.companyAddress?.[0];

// 	if (!primaryAddress) {
// 		throw new Error("No valid address found for seller");
// 	}

// 	// Build full address string
// 	const addressParts = [primaryAddress.street, primaryAddress.pincode].filter(
// 		Boolean
// 	);

// 	const tagName = primaryAddress.tagName || "Head Office";
// 	const isHeadOffice = tagName.toLowerCase() === "head office";
// 	const locationType = isHeadOffice ? "Office" : "Home";

// 	return {
// 		location_type: locationType,
// 		name:
// 			company.companyName || primaryAddress.building || "Ladwa Solutions Inc",
// 		phone: parseInt(company.phone) || 0,
// 		address:
// 			addressParts.join(", ") ||
// 			"PF office road, 37/1, 6th Main Rd, AECS Layout - A Block, Industrial Area, Singasandra, Bengaluru, Karnataka",
// 		city: primaryAddress.city || "Bengaluru",
// 		state: primaryAddress.state || "Karnataka",
// 		country: primaryAddress.country || "India",
// 		pin: parseInt(primaryAddress.pincode) || 560068,
// 	};
// }

// /**
//  * Format delivery address for Hexalog API
//  * @param {Object} deliveryAddress - Delivery address object
//  * @returns {Object} Formatted delivery address
//  */
// function formatDeliveryAddress(deliveryAddress, customerMobile) {
// 	// Build full address string
// 	const addressParts = [
// 		deliveryAddress.building,
// 		deliveryAddress.street,
// 		deliveryAddress.fullAddress,
// 	].filter(Boolean);

// 	return {
// 		location_type: deliveryAddress.tagName || "Home",
// 		address: addressParts.join(", ") || deliveryAddress.street || "Address", // required
// 		city: deliveryAddress.city || "City",
// 		state: deliveryAddress.state || "State",
// 		country: deliveryAddress.country || "India", // required
// 		name: deliveryAddress.name || "Customer", // required
// 		phone: parseInt(deliveryAddress.phone || customerMobile), // required
// 		pin: parseInt(deliveryAddress.pincode || deliveryAddress.zipCode) || 0, // required
// 	};
// }

// /**
//  * Create shipment package for a subOrder
//  * @param {Object} subOrder - SubOrder object
//  * @param {Object} deliveryAddress - Delivery address
//  * @param {Object} sellerInfo - Seller information
//  * @returns {Object} Shipment package details
//  */
// export async function createShipmentPackage(
// 	subOrder,
// 	deliveryAddress,
// 	customerMobile
// ) {
// 	try {
// 		console.log(`🚀 Creating shipment package for SubOrder: ${subOrder._id}`);

// 		// Calculate package details
// 		const packageDetails = calculatePackageDetails(subOrder.products);

// 		// Fetch seller's company details
// 		const companyDetails = await getSellerCompanyDetails(subOrder.sellerId);

// 		if (!companyDetails) {
// 			throw new Error(
// 				`Company details not found for seller ${subOrder.sellerId}`
// 			);
// 		}

// 		// Format pickup address from company details
// 		const pickupAddress = formatPickupAddress(companyDetails);

// 		// Format delivery address
// 		const deliveryAddr = formatDeliveryAddress(deliveryAddress, customerMobile);

// 		// Prepare Hexalog shipment payload
// 		const hexalogPayload = {
// 			seller_name: pickupAddress.name, // required
// 			seller_address: pickupAddress.address, // required
// 			seller_gst_tin: companyDetails.gstinNumber || "", // required
// 			consignee_gst_amount: 100, // Example GST amount // required
// 			order_number: subOrder._id.toString() || "ORDER12345", // required
// 			invoice_number: subOrder._id.toString() || "INV12345", // required
// 			invoice_date: subOrder.createdAt
// 				? subOrder.createdAt.toISOString().split("T")[0]
// 				: new Date().toISOString().split("T")[0], // required
// 			consignee_name: deliveryAddr.name, // required
// 			products_desc: subOrder.products.map((p) => p.productName).join(", "), // required
// 			payment_mode: subOrder.paymentMethod, // or "Prepaid" // required
// 			category_of_goods: "Safety Equipment", // required
// 			total_amount: subOrder.totalAmount || 0, // required
// 			tax_value: subOrder.tax || 0, // required
// 			taxable_amount: subOrder.taxableAmount || 0, // required
// 			commodity_value: subOrder.totalAmount.toString(), // required // taxable amount
// 			cod_amount: subOrder.paymentMethod === "COD" ? subOrder.totalAmount : 0, // required
// 			quantity: subOrder.products.reduce(
// 				(sum, p) => sum + (p.quantity || 1),
// 				0
// 			), // required
// 			weight: packageDetails.chargeableWeight, // required
// 			length: packageDetails.length, // required
// 			width: packageDetails.width, // required
// 			height: packageDetails.height, // required
// 			pickup_location: pickupAddress, // required
// 			drop_location: deliveryAddr, // required
// 		};

// 		console.log(`📦 Package details calculated:`, packageDetails);
// 		console.log(`📍 Pickup address:`, pickupAddress);
// 		console.log(`📍 Delivery address:`, deliveryAddr);

// 		// Create shipment with Hexalog
// 		let hexalogResponse = null;
// 		let trackingId = null;
// 		let courierPartner = null;
// 		let barcodes = null;

// 		try {
// 			console.log(`🔗 Creating Hexalog shipment...`);
// 			hexalogResponse = await createHexalogShipment(hexalogPayload);

// 			if (hexalogResponse && hexalogResponse.success !== false) {
// 				trackingId = hexalogResponse.tracking_id; // required for tracking
// 				courierPartner = hexalogResponse.vendor; // courier partner name like "Bluedart", "Delhivery" etc.
// 				barcodes = hexalogResponse.barcodes; // It's an object { "wbn", "order", "cod" }

// 				console.log(`✅ Hexalog shipment created successfully:`, {
// 					trackingId,
// 					courierPartner,
// 					barcodes,
// 				});
// 			} else {
// 				console.warn(`⚠️ Hexalog shipment creation failed:`, hexalogResponse);
// 			}
// 		} catch (hexalogError) {
// 			console.error(
// 				`❌ Hexalog shipment creation error:`,
// 				hexalogError.message
// 			);
// 			logShipmentError(
// 				subOrder._id.toString(),
// 				"hexalog_creation_failed",
// 				hexalogError.message,
// 				{ hexalogPayload }
// 			);
// 			// Continue with local shipment package creation even if Hexalog fails
// 		}

// 		// Create shipment package object
// 		const shipmentPackage = {
// 			packageDetails: packageDetails,
// 			pickupAddress: pickupAddress,
// 			deliveryAddress: deliveryAddr,
// 			trackingId: trackingId,
// 			courierPartner: courierPartner,
// 			barcodes: barcodes,
// 			status: "order_placed",
// 			shipmentCreatedAt: new Date(),
// 			shippingCost: subOrder.shippingCost || 0,
// 		};

// 		console.log(`📋 Shipment package created for SubOrder ${subOrder._id}:`, {
// 			trackingId: shipmentPackage.trackingId,
// 			status: shipmentPackage.status,
// 		});

// 		// Log successful shipment creation
// 		logShipmentCreation(subOrder._id.toString(), shipmentPackage, "created");

// 		return shipmentPackage;
// 	} catch (error) {
// 		console.error(
// 			`❌ Failed to create shipment package for SubOrder ${subOrder._id}:`,
// 			error
// 		);
// 		logShipmentError(
// 			subOrder._id.toString(),
// 			"shipment_creation_failed",
// 			error.message,
// 			{ error: error.stack }
// 		);
// 		throw error;
// 	}
// }

// /**
//  * Estimate shipping cost and delivery time for an order
//  * @param {Object} params - Shipping parameters
//  * @param {String} params.pickupPincode - Pickup pincode
//  * @param {String} params.dropPincode - Delivery pincode
//  * @param {Number} params.length - Package length in cm
//  * @param {Number} params.width - Package width in cm
//  * @param {Number} params.height - Package height in cm
//  * @param {Number} params.weight - Package weight in grams
//  * @param {String} params.paymentType - Payment type (Prepaid/COD)
//  * @param {Number} params.invoiceAmount - Order value
//  * @returns {Promise<Object>} Shipping estimate with cost and delivery time
//  */
// export async function estimateShippingCost(params) {
// 	try {
// 		const estimate = await getShippingEstimate(params);
// 		return {
// 			preTax: estimate.preTax,
// 			tax: estimate.tax,
// 			total: estimate.total,
// 			tat: estimate.tat,
// 		};
// 	} catch (error) {
// 		console.error("Error estimating shipping cost:", error);
// 		// Return default values if API fails
// 		return {
// 			preTax: 129.0,
// 			tax: 23.22,
// 			total: 152.22,
// 			tat: {
// 				min: 3,
// 				max: 5,
// 			},
// 		};
// 	}
// }

import { createHexalogShipment, getShippingEstimate } from "@/lib/hexalog.js";
import {
        logShipmentCreation,
        logShipmentError,
} from "@/lib/reports/shipmentLogger.js";
import Company from "@/model/companyDetails.js";
import { sendMail } from "@/lib/mail.js";
import { computePackageDimensions } from "./packaging.js";

function escapeHtml(value = "") {
        return String(value)
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll('"', "&quot;")
                .replaceAll("'", "&#39;");
}

function formatJsonForEmail(obj) {
        try {
                return `<pre style="background:#f9fafb;padding:12px;border-radius:6px;max-width:800px;overflow:auto;font-size:12px;line-height:1.4">${escapeHtml(
                        JSON.stringify(obj, null, 2)
                )}</pre>`;
        } catch (error) {
                return `<pre style="color:#b91c1c">${escapeHtml(
                        `Failed to format JSON: ${error.message}`
                )}</pre>`;
        }
}

async function sendMissingTrackingIdAlert({
        subOrder,
        hexalogPayload,
        hexalogResponse,
}) {
        const recipients = ["sunil@ladwas.com", "deepak@ladwas.com"];

        const subOrderId = subOrder?._id?.toString?.() ?? "Unknown";
        const orderId = subOrder?.orderId?.toString?.() ?? "Unknown";

        const subject = `Hexalog tracking ID missing | Sub-order ${subOrderId}`;

        const html = `
                <p>Hi Team,</p>
                <p>
                        Hexalog returned a successful booking response for sub-order <strong>${escapeHtml(
                                subOrderId
                        )}</strong>
                        (parent order: <strong>${escapeHtml(
                                orderId
                        )}</strong>) but did not include a tracking ID.
                </p>
                <p>Please review the payload and response below:</p>
                <h3 style="margin-top:16px;margin-bottom:4px;font-size:14px">Hexalog Payload</h3>
                ${formatJsonForEmail(hexalogPayload)}
                <h3 style="margin-top:16px;margin-bottom:4px;font-size:14px">Hexalog Response</h3>
                ${formatJsonForEmail(hexalogResponse)}
                <p style="margin-top:16px">Regards,<br/>Safety Online Platform</p>
        `;

        try {
                await sendMail({ to: recipients, subject, html });
        } catch (mailError) {
                console.error("❌ Failed to send missing tracking ID alert email:", mailError);
        }
}

/**
 * Calculate accurate package dimensions and weight
 * using cartonization logic from packaging.js
 *
 * @param {Array} products - Array of product objects
 * @returns {Object} Package details
 */
export function calculatePackageDetails(products = []) {
	if (!Array.isArray(products) || products.length === 0) {
		throw new Error("Products array is required");
	}

	// Map products to the structure expected by computePackageDimensions
	const items = products.map((p) => ({
		length: p.length || p.dimensions?.length || 10,
		width: p.width || p.dimensions?.width || 10,
		height: p.height || p.dimensions?.height || 5,
		weight: p.weight ? p.weight * 1000 : 250,
		quantity: p.quantity || 1,
	}));

	// Compute optimized carton dimensions
	const base = computePackageDimensions(items);

	// Calculate volumetric weight (industry standard divisor = 5000)
	const volumetricWeight = Math.ceil(
		(base.length * base.width * base.height) / 5000
	);

	// Pick whichever is higher for billing (chargeable)
	const chargeableWeight = Math.max(base.weight, volumetricWeight);

	// Compute total package value
	const packageValue = products.reduce(
		(sum, p) => sum + (p.totalPrice || 0),
		0
	);

	return {
		length: base.length,
		width: base.width,
		height: base.height,
		actualWeight: base.weight,
		volumetricWeight,
		chargeableWeight,
		boxType: base.carton || "S",
		packageValue,
	};
}

/**
 * Get seller's company details for pickup address
 * @param {String} sellerId - Seller's user ID
 * @returns {Object} Company details or null
 */
async function getSellerCompanyDetails(sellerId) {
	try {
		const company = await Company.findOne({ user: sellerId }).lean();
		return company;
	} catch (error) {
		console.error(
			`Error fetching company details for seller ${sellerId}:`,
			error
		);
		return null;
	}
}

/**
 * Normalize phone number - remove country code and ensure max 10 digits
 * @param {String|Number} phone - Phone number
 * @returns {Number} Normalized phone number (max 9999999999)
 */
function normalizePhone(phone) {
	if (!phone) return 0;

	// Convert to string and remove all non-digits
	let phoneStr = String(phone).replace(/\D/g, "");

	// Remove +91 or 91 prefix if present
	if (phoneStr.startsWith("91") && phoneStr.length > 10) {
		phoneStr = phoneStr.substring(2);
	}

	// Take only last 10 digits
	phoneStr = phoneStr.slice(-10);

	// Convert to number and ensure it doesn't exceed max value
	const phoneNum = parseInt(phoneStr) || 0;
	return Math.min(phoneNum, 9999999999);
}

/**
 * Format pickup address from company details
 * @param {Object} company - Company details
 * @returns {Object} Formatted pickup address
 */
function formatPickupAddress(company) {
	if (!company) {
		throw new Error("Company details not found for seller");
	}

	// Prefer stored primary pickup address, then "head office" tag, then first available
	const primaryAddress =
		company.primaryPickupAddress ||
		company.companyAddress?.find(
			(addr) => addr.tagName?.toLowerCase() === "head office"
		) ||
		company.companyAddress?.[0];

	if (!primaryAddress) {
		throw new Error("No valid address found for seller");
	}

	// Build full address string
	const addressParts = [primaryAddress.street, primaryAddress.pincode].filter(
		Boolean
	);

	const tagName = primaryAddress.tagName || "Head Office";
	const isHeadOffice = tagName.toLowerCase() === "head office";
	const locationType = isHeadOffice ? "Office" : "Home";

	return {
		location_type: locationType,
		name:
			company.companyName || primaryAddress.building || "Ladwa Solutions Inc",
		phone: normalizePhone(company.phone),
		address:
			addressParts.join(", ") ||
			"PF office road, 37/1, 6th Main Rd, AECS Layout - A Block, Industrial Area, Singasandra, Bengaluru, Karnataka",
		city: primaryAddress.city || "Bengaluru",
		state: primaryAddress.state || "Karnataka",
		country: primaryAddress.country || "India",
		pin: parseInt(primaryAddress.pincode) || 560068,
	};
}

/**
 * Format delivery address for Hexalog API
 * @param {Object} deliveryAddress - Delivery address object
 * @returns {Object} Formatted delivery address
 */
function formatDeliveryAddress(deliveryAddress, customerMobile) {
	// Build full address string
	const addressParts = [
		deliveryAddress.building,
		deliveryAddress.street,
		deliveryAddress.fullAddress,
	].filter(Boolean);

	return {
		location_type: deliveryAddress.tagName || "Home",
		address: addressParts.join(", ") || deliveryAddress.street || "Address",
		city: deliveryAddress.city || "City",
		state: deliveryAddress.state || "State",
		country: deliveryAddress.country || "India",
		name: deliveryAddress.name || "Customer",
		phone: normalizePhone(deliveryAddress.phone || customerMobile),
		pin: parseInt(deliveryAddress.pincode || deliveryAddress.zipCode) || 0,
	};
}

/**
 * Create shipment package for a subOrder
 * @param {Object} subOrder - SubOrder object
 * @param {Object} deliveryAddress - Delivery address
 * @param {String} customerMobile - Customer mobile number
 * @returns {Object} Shipment package details
 */
export async function createShipmentPackage(
        subOrder,
        deliveryAddress,
        customerMobile
) {
        try {
                console.log(`🚀 Creating shipment package for SubOrder: ${subOrder._id}`);

                const shippingCostValue = Number(subOrder?.shippingCost ?? NaN);
                if (!Number.isFinite(shippingCostValue) || shippingCostValue <= 0) {
                        const errorMessage =
                                "Shipping cost is missing from Hexalog estimate. Shipment booking aborted.";
                        console.error(
                                `❌ Cannot create shipment package for SubOrder ${subOrder._id}:`,
                                errorMessage
                        );
                        logShipmentError(
                                subOrder._id.toString(),
                                "hexalog_missing_shipping_cost",
                                errorMessage,
                                {
                                        shippingCost: subOrder?.shippingCost ?? null,
                                        orderId: subOrder?.orderId?.toString?.() ?? null,
                                }
                        );
                        throw new Error(errorMessage);
                }

                // Calculate package details
                const packageDetails = calculatePackageDetails(subOrder.products);

		// Fetch seller's company details
		const companyDetails = await getSellerCompanyDetails(subOrder.sellerId);

		if (!companyDetails) {
			throw new Error(
				`Company details not found for seller ${subOrder.sellerId}`
			);
		}

		// Format pickup address from company details
		const pickupAddress = formatPickupAddress(companyDetails);

		// Format delivery address
		const deliveryAddr = formatDeliveryAddress(deliveryAddress, customerMobile);

		// Prepare Hexalog shipment payload
		const hexalogPayload = {
			seller_name: pickupAddress.name,
			seller_address: pickupAddress.address,
			seller_gst_tin: companyDetails.gstinNumber || "",
			consignee_gst_amount: 100,
			order_number: subOrder._id.toString() || "ORDER12345",
			invoice_number: subOrder._id.toString() || "INV12345",
			invoice_date: subOrder.createdAt
				? subOrder.createdAt.toISOString().split("T")[0]
				: new Date().toISOString().split("T")[0],
			consignee_name: deliveryAddr.name,
			products_desc: subOrder.products.map((p) => p.productName).join(", "),
			payment_mode: subOrder.paymentMethod,
			category_of_goods: "Safety Equipment",
			total_amount: subOrder.totalAmount || 0,
			tax_value: subOrder.tax || 0,
			taxable_amount: subOrder.taxableAmount || 0,
			commodity_value: subOrder.totalAmount.toString(),
			cod_amount: subOrder.paymentMethod === "COD" ? subOrder.totalAmount : 0,
			quantity: subOrder.products.reduce(
				(sum, p) => sum + (p.quantity || 1),
				0
			),
			weight: packageDetails.chargeableWeight,
			length: packageDetails.length,
			width: packageDetails.width,
			height: packageDetails.height,
			pickup_location: pickupAddress,
			drop_location: deliveryAddr,
		};

		console.log(`📦 Package details calculated:`, packageDetails);
		console.log(`📍 Pickup address:`, pickupAddress);
		console.log(`📍 Delivery address:`, deliveryAddr);

		// Create shipment with Hexalog
                let hexalogResponse = null;
                let trackingId = null;
                let courierPartner = null;
                let barcodes = null;
                let requiresAttention = false;
                let attentionReason = null;
                let attentionDetails = null;

                try {
                        console.log(`🔗 Creating Hexalog shipment...`);
                        hexalogResponse = await createHexalogShipment(hexalogPayload);

                        if (hexalogResponse && hexalogResponse.success !== false) {
                                trackingId = hexalogResponse.tracking_id;
                                courierPartner = hexalogResponse.vendor;
                                barcodes = hexalogResponse.barcodes;

                                console.log(`✅ Hexalog shipment created successfully:`, {
                                        trackingId,
                                        courierPartner,
                                        barcodes,
                                });

                                if (!trackingId) {
                                        requiresAttention = true;
                                        attentionReason = "missing_tracking_id";
                                        attentionDetails =
                                                "Hexalog booking succeeded but no tracking_id was returned.";
                                        console.warn(
                                                `⚠️ Hexalog response missing tracking ID for SubOrder ${subOrder._id}`,
                                                hexalogResponse
                                        );
                                        await sendMissingTrackingIdAlert({
                                                subOrder,
                                                hexalogPayload,
                                                hexalogResponse,
                                        });
                                }
                        } else {
                                console.warn(`⚠️ Hexalog shipment creation failed:`, hexalogResponse);
                        }
                } catch (hexalogError) {
                        console.error(
				`❌ Hexalog shipment creation error:`,
				hexalogError.message
			);
			logShipmentError(
				subOrder._id.toString(),
				"hexalog_creation_failed",
				hexalogError.message,
				{ hexalogPayload }
			);
		}

		// Create shipment package object
		const shipmentPackage = {
			packageDetails: packageDetails,
			pickupAddress: pickupAddress,
			deliveryAddress: deliveryAddr,
			trackingId: trackingId,
                        courierPartner: courierPartner,
                        barcodes: barcodes,
                        status: "order_placed",
                        shipmentCreatedAt: new Date(),
                        shippingCost: shippingCostValue,
                        requiresAttention,
                        attentionReason,
                        attentionDetails,
                };

		console.log(`📋 Shipment package created for SubOrder ${subOrder._id}:`, {
			trackingId: shipmentPackage.trackingId,
			status: shipmentPackage.status,
		});

		// Log successful shipment creation
		logShipmentCreation(subOrder._id.toString(), shipmentPackage, "created");

		return shipmentPackage;
	} catch (error) {
		console.error(
			`❌ Failed to create shipment package for SubOrder ${subOrder._id}:`,
			error
		);
		logShipmentError(
			subOrder._id.toString(),
			"shipment_creation_failed",
			error.message,
			{ error: error.stack }
		);
		throw error;
	}
}

/**
 * Estimate shipping cost and delivery time for an order
 * @param {Object} params - Shipping parameters
 * @param {String} params.pickupPincode - Pickup pincode
 * @param {String} params.dropPincode - Delivery pincode
 * @param {Number} params.length - Package length in cm
 * @param {Number} params.width - Package width in cm
 * @param {Number} params.height - Package height in cm
 * @param {Number} params.weight - Package weight in grams
 * @param {String} params.paymentType - Payment type (Prepaid/COD)
 * @param {Number} params.invoiceAmount - Order value
 * @returns {Promise<Object>} Shipping estimate with cost and delivery time
 * @throws {Error} If shipping estimate fails
 */
export async function estimateShippingCost(params) {
	try {
		const estimate = await getShippingEstimate(params);
		return {
			preTax: estimate.preTax,
			tax: estimate.tax,
			total: estimate.total,
			tat: estimate.tat,
		};
	} catch (error) {
		console.error("Error estimating shipping cost:", error);
		throw new Error(
			error.message || "Failed to calculate shipping cost. Please try again."
		);
	}
}
