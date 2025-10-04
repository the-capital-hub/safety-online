import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { toast } from "react-hot-toast";

export const useSellerAuthStore = create(
	devtools(
		persist(
			(set, get) => ({
				seller: null,
				loading: false,
				error: null,

				// Set seller
				setSeller: (seller) => set({ seller }),

				// Clear seller
				clearSeller: () => set({ seller: null }),

				// Login seller
				login: async (credentials) => {
					set({ loading: true, error: null });
					try {
						const response = await fetch("/api/seller/auth/login", {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify(credentials),
						});

						const data = await response.json();

						if (data.success) {
							set({
								seller: data.seller,
								loading: false,
							});
							toast.success("Login successful");
							return { success: true };
						} else {
							set({ error: data.message, loading: false });
							toast.error(data.message);
							return { success: false, message: data.message };
						}
					} catch (error) {
						set({ error: "Login failed", loading: false });
						toast.error("Login failed");
						return { success: false, message: "Login failed" };
					}
				},

				// Register seller
                                register: async (sellerData) => {
                                        set({ loading: true, error: null });
                                        try {
                                                const response = await fetch("/api/seller/auth/register", {
                                                        method: "POST",
                                                        headers: {
                                                                "Content-Type": "application/json",
                                                        },
                                                        body: JSON.stringify(sellerData),
                                                });

                                                const data = await response.json();

                                                if (data.success) {
                                                        set({ loading: false });
                                                        toast.success("Registration successful! Please login.");
                                                        return { success: true };
                                                } else {
                                                        set({ error: data.message, loading: false });
                                                        toast.error(data.message);
                                                        return { success: false, message: data.message };
                                                }
                                        } catch (error) {
                                                set({ error: "Registration failed", loading: false });
                                                toast.error("Registration failed");
                                                return { success: false, message: "Registration failed" };
                                        }
                                },

				// Update profile
				updateProfile: async (profileData) => {
					set({ loading: true, error: null });
					try {
						const response = await fetch("/api/seller/profile/update", {
							method: "PUT",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify(profileData),
							credentials: "include",
						});

						const data = await response.json();

						if (data.success) {
							set({
								seller: data.seller,
								loading: false,
							});
							toast.success("Profile updated successfully");
							return { success: true };
						} else {
							set({ error: data.message, loading: false });
							toast.error(data.message);
							return { success: false, message: data.message };
						}
					} catch (error) {
						set({ error: "Profile update failed", loading: false });
						toast.error("Profile update failed");
						return { success: false, message: "Profile update failed" };
					}
				},

				// Clear error
				clearError: () => set({ error: null }),
			}),
			{
				name: "seller-auth-storage",
				partialize: (state) => ({ seller: state.seller }),
			}
		)
	)
);

// Selectors
export const useLoggedInSeller = () =>
	useSellerAuthStore((state) => state.seller);

export const useSellerFullName = () =>
	useSellerAuthStore((state) =>
		state.seller ? `${state.seller.firstName} ${state.seller.lastName}` : ""
	);

export const useSellerEmail = () =>
	useSellerAuthStore((state) => state.seller?.email || "");

export const useSellerProfilePic = () =>
	useSellerAuthStore((state) => state.seller?.profilePic || "");

export const useIsSellerAuthenticated = () =>
	useSellerAuthStore((state) => !!state.seller);
