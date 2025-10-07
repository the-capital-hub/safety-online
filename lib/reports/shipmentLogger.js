// Maintain shipment logs in-memory rather than writing to disk. This prevents
// the application from creating or updating the `logs/shipment-logs.json` file
// while still giving us access to recent log history for debugging purposes.
const shipmentLogs = [];

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

        // Persist in memory only. Keep the list to a manageable size.
        shipmentLogs.push(logEntry);

        if (shipmentLogs.length > 1000) {
                shipmentLogs.splice(0, shipmentLogs.length - 1000);
        }

	return logEntry;
}

/**
 * Get shipment logs for a specific subOrder
 * @param {String} subOrderId - SubOrder ID
 * @returns {Array} Array of log entries
 */
export function getShipmentLogs(subOrderId) {
        return shipmentLogs.filter((log) => log.subOrderId === subOrderId);
}

/**
 * Get all shipment logs with optional filtering
 * @param {Object} filters - Optional filters
 * @returns {Array} Array of log entries
 */
export function getAllShipmentLogs(filters = {}) {
        let logs = [...shipmentLogs];

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
