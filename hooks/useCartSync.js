"use client";

import { useState } from "react";

import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";

export function useCartSync() {
	const { setAuthenticated, syncWithServer, forceSync } = useCartStore();

	// Mock authentication state - replace with your actual auth logic
	const [user, setUser] = useState(null);

	// Sync authentication state
	useEffect(() => {
		setAuthenticated(!!user);
	}, [user, setAuthenticated]);

	// Initial sync when user logs in
	useEffect(() => {
		if (user) {
			syncWithServer();
		}
	}, [user, syncWithServer]);

	// Expose manual sync function
	return {
		forceSync,
		isAuthenticated: !!user,
		user,
		setUser, // For testing purposes
	};
}
