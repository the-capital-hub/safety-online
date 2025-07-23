"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useWishlistStore = create((set) => ({
	isOpen: false,
	product: null,
	openWishlist: (product) => set({ isOpen: true, product }),
	closeWishlist: () => set({ isOpen: false, product: null }),
}));
