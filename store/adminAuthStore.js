import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const useAdminAuthStore = create(
	devtools(
		persist(
			(set) => ({
				user: null,
				setAdminUser: (user) => set({ user }),
				clearAdminUser: () => set({ user: null }),
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
export const useLoggedInUser = () => useAdminAuthStore((state) => state.user);

export const useUserFullName = () =>
	useAdminAuthStore(
		(state) => state.user?.firstName + " " + state.user?.lastName
	);

export const useUserEmail = () =>
	useAdminAuthStore((state) => state.user?.email || "");

export const useUserProfilePic = () =>
	useAdminAuthStore((state) => state.user?.profilePic || "");

export const useIsAuthenticated = () =>
	useAdminAuthStore((state) => !!state.user);
