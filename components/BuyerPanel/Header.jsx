"use client";

import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/SafetyLogo.png";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, ShoppingCart, Heart, User, X, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import MiniCart from "@/components/BuyerPanel/cart/MiniCart.jsx";
import MiniWishlist from "@/components/BuyerPanel/wishlist/MiniWishlist.jsx";
import {
        useUserFullName,
        useUserEmail,
        useUserProfilePic,
        useIsAuthenticated,
} from "@/store/authStore.js";
import useRequireAuth from "@/hooks/useRequireAuth.js";
import NavigationBar from "@/components/BuyerPanel/NavigationBar.jsx";
import { useProductStore } from "@/store/productStore.js";
import { useState } from "react";

export default function Header() {
	const fullName = useUserFullName();
	const email = useUserEmail();
	const profilePic = useUserProfilePic();
	const isAuthenticated = useIsAuthenticated();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [showSearch, setShowSearch] = useState(false);
        const router = useRouter();
        const requireAuth = useRequireAuth();
	const { setSearchQuery: setGlobalSearch } = useProductStore();

	// Cart functionality
	const { getTotalItems: getCartTotalItems, openCart } = useCartStore();
	const cartTotalItems = getCartTotalItems();

	// Wishlist functionality
	const { getTotalItems: getWishlistTotalItems, openWishlist } =
		useWishlistStore();
	const wishlistTotalItems = getWishlistTotalItems();

        const handleCartClick = () => {
                if (!requireAuth({ message: "Please login to view your cart" })) {
                        return;
                }
                openCart();
        };

        const handleWishlistClick = () => {
                if (!requireAuth({ message: "Please login to view your wishlist" })) {
                        return;
                }
                openWishlist();
        };

	const handleSearch = (e) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			setGlobalSearch(searchQuery);
			router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
			setShowSearch(false);
		}
	};

	return (
		<>
			<header className="bg-white shadow-sm sticky top-0 z-40">
				<div className="px-4 lg:px-10">
					{/* Top Bar */}
					<div className="flex items-center justify-between py-3 gap-2">
						<div className="flex items-center space-x-2 md:space-x-4">
							<Button
								variant="ghost"
								size="icon"
								className="lg:hidden"
								onClick={() => setIsMenuOpen(!isMenuOpen)}
							>
								{isMenuOpen ? (
									<X className="h-6 w-6" />
								) : (
									<Menu className="h-6 w-6" />
								)}
							</Button>

							<Link href="/" className="flex items-center space-x-2">
								<Image
									src={Logo}
									alt="Logo"
									className="h-auto w-20 lg:w-24 object-cover"
								/>
							</Link>
						</div>

						<div className="flex-1 px-2 hidden md:block">
							<form onSubmit={handleSearch} className="relative">
								<Input
									placeholder="Search products..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10 pr-4 rounded-full bg-gray-100 focus:bg-white transition-colors"
								/>
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
							</form>
						</div>

						<div className="flex items-center space-x-2 md:space-x-4">
							<Button
								variant="ghost"
								size="icon"
								className="md:hidden"
								onClick={() => setShowSearch(true)}
							>
								<Search className="h-5 w-5" />
							</Button>

							{/* Wishlist Button */}
							<Button
								variant="ghost"
								size="icon"
								className="relative"
								onClick={handleWishlistClick}
							>
								<Heart className={`h-5 w-5 md:h-6 md:w-6`} />
								{wishlistTotalItems > 0 && (
									<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
										{wishlistTotalItems > 99 ? "99+" : wishlistTotalItems}
									</span>
								)}
							</Button>

							{/* Cart Button */}
							<Button
								variant="ghost"
								size="icon"
								className="relative"
								onClick={handleCartClick}
							>
								<ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
								{cartTotalItems > 0 && (
									<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
										{cartTotalItems > 99 ? "99+" : cartTotalItems}
									</span>
								)}
							</Button>

							{isAuthenticated ? (
								<div className="flex items-center space-x-2 md:space-x-4">
									<Link href="/account/profile">
										<div className="flex items-center space-x-2">
											<Image
												src={profilePic}
												alt="Profile"
												width={40}
												height={40}
												className="h-6 w-6 md:h-8 md:w-8 rounded-full"
											/>
											<div className="hidden md:block">
												<p className="text-sm font-medium">{fullName}</p>
												<p className="text-xs text-gray-600">{email}</p>
											</div>
										</div>
									</Link>
								</div>
							) : (
								<Link href="/login">
									<Button variant="ghost" size="icon">
										<User className="h-5 w-5 md:h-6 md:w-6" />
									</Button>
								</Link>
							)}
						</div>
					</div>
				</div>
			</header>

			{showSearch && (
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="fixed inset-x-0 top-0 p-4 bg-white shadow-md md:hidden z-50"
				>
					<form onSubmit={handleSearch} className="relative">
						<Input
							autoFocus
							placeholder="Search products..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 pr-10 rounded-full bg-gray-100 focus:bg-white transition-colors"
						/>
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="absolute right-1 top-1/2 -translate-y-1/2"
							onClick={() => setShowSearch(false)}
						>
							<X className="h-4 w-4" />
						</Button>
					</form>
				</motion.div>
			)}

			{/* Mini Components */}
			<MiniCart />
			<MiniWishlist />

			<div className="md:hidden block">
				<NavigationBar
					isMenuOpen={isMenuOpen}
					onMenuClose={() => setIsMenuOpen(false)}
				/>
			</div>
		</>
	);
}
