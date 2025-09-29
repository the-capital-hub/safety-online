"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const useAuthStore = create(
	devtools(
		persist(
			(set) => ({
				user: null,
				setUser: (user) => set({ user }),
                                clearUser: () => set({ user: null }),
                                logout: async (redirectPath = "/login") => {
                                        set({ user: null });

                                        if (typeof window === "undefined") {
                                                return;
                                        }

                                        try {
                                                await fetch("/api/auth/logout", { method: "POST" });
                                        } catch (error) {
                                                console.error("Failed to call logout endpoint:", error);
                                        } finally {
                                                if (window.location.pathname !== redirectPath) {
                                                        window.location.href = redirectPath;
                                                }
                                        }
                                },
			}),
			{
				name: "logged-in-user",
				partialize: (state) => ({ user: state.user }),
				// storage: () => sessionStorage,
			}
		)
	)
);

// Selectors
export const useLoggedInUser = () => useAuthStore((state) => state.user);

export const useUserFullName = () =>
	useAuthStore((state) => state.user?.firstName + " " + state.user?.lastName);

export const useUserFirstName = () =>
	useAuthStore((state) => state.user?.firstName);

export const useUserLastName = () =>
	useAuthStore((state) => state.user?.lastName);

export const useUserEmail = () => useAuthStore((state) => state.user?.email);

export const useUsermobile = () => useAuthStore((state) => state.user?.mobile);

export const useUserProfilePic = () =>
	useAuthStore((state) => state.user?.profilePic);

export const useIsAuthenticated = () => useAuthStore((state) => !!state.user);
