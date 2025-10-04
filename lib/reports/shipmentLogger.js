import fs from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");
const SHIPMENT_LOG_FILE = path.join(LOG_DIR, "shipment-logs.json");

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
	fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Log shipment events for tracking and debugging
 * @param {Object} logData - Log data object
 */
export function logShipmentEvent(logData) {
	const timestamp = new Date().toISOString();
	const logEntry = {
		timestamp,
		...logData,
	};

	// Console log for immediate visibility
	console.log(`📝 SHIPMENT LOG [${logData.action?.toUpperCase()}]:`, logEntry);

	// Write to file for persistent logging
	try {
		let logs = [];

		// Read existing logs
		if (fs.existsSync(SHIPMENT_LOG_FILE)) {
			const fileContent = fs.readFileSync(SHIPMENT_LOG_FILE, "utf8");
			logs = JSON.parse(fileContent);
		}

		// Add new log entry
		logs.push(logEntry);

		// Keep only last 1000 entries to prevent file from growing too large
		if (logs.length > 1000) {
			logs = logs.slice(-1000);
		}

		// Write back to file
		fs.writeFileSync(SHIPMENT_LOG_FILE, JSON.stringify(logs, null, 2));
	} catch (error) {
		console.error("Failed to write shipment log:", error);
	}

	return logEntry;
}

/**
 * Get shipment logs for a specific subOrder
 * @param {String} subOrderId - SubOrder ID
 * @returns {Array} Array of log entries
 */
export function getShipmentLogs(subOrderId) {
	try {
		if (!fs.existsSync(SHIPMENT_LOG_FILE)) {
			return [];
		}

		const fileContent = fs.readFileSync(SHIPMENT_LOG_FILE, "utf8");
		const logs = JSON.parse(fileContent);

		return logs.filter((log) => log.subOrderId === subOrderId);
	} catch (error) {
		console.error("Failed to read shipment logs:", error);
		return [];
	}
}

/**
 * Get all shipment logs with optional filtering
 * @param {Object} filters - Optional filters
 * @returns {Array} Array of log entries
 */
export function getAllShipmentLogs(filters = {}) {
	try {
		if (!fs.existsSync(SHIPMENT_LOG_FILE)) {
			return [];
		}

		const fileContent = fs.readFileSync(SHIPMENT_LOG_FILE, "utf8");
		let logs = JSON.parse(fileContent);

		// Apply filters
		if (filters.action) {
			logs = logs.filter((log) => log.action === filters.action);
		}
		if (filters.status) {
			logs = logs.filter((log) => log.status === filters.status);
		}
		if (filters.dateFrom) {
			logs = logs.filter(
				(log) => new Date(log.timestamp) >= new Date(filters.dateFrom)
			);
		}
		if (filters.dateTo) {
			logs = logs.filter(
				(log) => new Date(log.timestamp) <= new Date(filters.dateTo)
			);
		}

		return logs;
	} catch (error) {
		console.error("Failed to read shipment logs:", error);
		return [];
	}
}

/**
 * Log shipment creation
 * @param {String} subOrderId - SubOrder ID
 * @param {Object} shipmentPackage - Shipment package details
 * @param {String} action - Action performed
 */
export function logShipmentCreation(
	subOrderId,
	shipmentPackage,
	action = "created"
) {
	return logShipmentEvent({
		subOrderId,
		action,
		trackingId: shipmentPackage?.trackingId,
		status: shipmentPackage?.status,
		courierPartner: shipmentPackage?.courierPartner,
		packageDetails: {
			weight: shipmentPackage?.packageDetails?.actualWeight,
			dimensions: shipmentPackage?.packageDetails
				? `${shipmentPackage.packageDetails.length}x${shipmentPackage.packageDetails.width}x${shipmentPackage.packageDetails.height}`
				: null,
			boxType: shipmentPackage?.packageDetails?.boxType,
			packageValue: shipmentPackage?.packageDetails?.packageValue,
		},
		addresses: {
			pickup: {
				city: shipmentPackage?.pickupAddress?.city,
				state: shipmentPackage?.pickupAddress?.state,
				zipCode: shipmentPackage?.pickupAddress?.zipCode,
			},
			delivery: {
				city: shipmentPackage?.deliveryAddress?.city,
				state: shipmentPackage?.deliveryAddress?.state,
				zipCode: shipmentPackage?.deliveryAddress?.zipCode,
			},
		},
	});
}

/**
 * Log shipment status update
 * @param {String} subOrderId - SubOrder ID
 * @param {String} trackingId - Tracking ID
 * @param {String} oldStatus - Previous status
 * @param {String} newStatus - New status
 * @param {Object} additionalData - Additional tracking data
 */
export function logShipmentStatusUpdate(
	subOrderId,
	trackingId,
	oldStatus,
	newStatus,
	additionalData = {}
) {
	return logShipmentEvent({
		subOrderId,
		action: "status_update",
		trackingId,
		oldStatus,
		newStatus,
		currentLocation: additionalData.currentLocation,
		deliveryAttempts: additionalData.deliveryAttempts,
		deliveryNotes: additionalData.deliveryNotes,
		timestamp: additionalData.timestamp,
	});
}

/**
 * Log shipment tracking request
 * @param {String} subOrderId - SubOrder ID
 * @param {String} trackingId - Tracking ID
 * @param {Object} trackingData - Tracking data received
 */
export function logShipmentTracking(subOrderId, trackingId, trackingData) {
	return logShipmentEvent({
		subOrderId,
		action: "tracking_request",
		trackingId,
		trackingData: {
			status: trackingData?.status,
			currentLocation: trackingData?.currentLocation,
			lastUpdate: trackingData?.lastUpdate,
			timeline: trackingData?.timeline?.length || 0,
		},
	});
}

/**
 * Log shipment error
 * @param {String} subOrderId - SubOrder ID
 * @param {String} errorType - Type of error
 * @param {String} errorMessage - Error message
 * @param {Object} context - Additional context
 */
export function logShipmentError(
	subOrderId,
	errorType,
	errorMessage,
	context = {}
) {
	return logShipmentEvent({
		subOrderId,
		action: "error",
		errorType,
		errorMessage,
		context,
	});
}
