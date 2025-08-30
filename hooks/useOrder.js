"use client";

import { useState, useEffect } from "react";

const useOrder = () => {
	const [order, setOrder] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchOrder = async (id) => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch(`/api/admin/orders/${id}`);
			const data = await response.json();

			if (data.success) {
				setOrder(data.order);
				setLoading(false);
			} else {
				setError(data.message);
				setLoading(false);
			}
		} catch (error) {
			setError("Failed to fetch order");
			setLoading(false);
		}
	};

	const downloadInvoice = async (orderId, orderNumber) => {
		try {
			const response = await fetch(`/api/orders/${orderId}/invoice`);

			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `invoice-${orderNumber}.pdf`;
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);
				return { success: true };
			} else {
				return { success: false, message: "Failed to download invoice" };
			}
		} catch (error) {
			return { success: false, message: "Failed to download invoice" };
		}
	};

	return { order, loading, error, fetchOrder, downloadInvoice };
};

export default useOrder;
