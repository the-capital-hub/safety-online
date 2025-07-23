"use client";

import Image from "next/image";
import Logo from "@/public/SafetyLogo.png";

import { Button } from "@/components/ui/button";
import { Menu, ShoppingCart, Heart, User, X } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import MiniCart from "./cart/MiniCart";

export default function Header({ onMenuToggle, isMenuOpen }) {
	const { getTotalItems, openCart } = useCartStore();
	const totalItems = getTotalItems();

	const handleCartClick = () => {
		openCart();
	};

	return (
		<>
			<header className="bg-white shadow-sm sticky top-0 z-40">
				<div className="px-4 lg:px-10">
					{/* Top Bar */}
					<div className="flex items-center justify-between py-3">
						{/* Desktop Menu */}
						<div className="hidden lg:block">
							<Button variant="ghost" size="icon" onClick={onMenuToggle}>
								{isMenuOpen ? (
									<X className="h-6 w-6" />
								) : (
									<Menu className="h-6 w-6" />
								)}
							</Button>
						</div>

						<div className="flex items-center space-x-2 md:space-x-4">
							<Button
								variant="ghost"
								size="icon"
								className="lg:hidden"
								onClick={onMenuToggle}
							>
								{isMenuOpen ? (
									<X className="h-6 w-6" />
								) : (
									<Menu className="h-6 w-6" />
								)}
							</Button>

							<Link href="/" className="flex items-center space-x-2">
								{/* <div className="h-8 w-20 lg:w-24 bg-gray-200 rounded flex items-center justify-center">
									<span className="text-xs font-bold">LOGO</span>
								</div> */}
								<Image
									src={Logo}
									alt="Logo"
									className="h-auto w-20 lg:w-24 object-cover"
								/>
							</Link>
						</div>

						<div className="flex items-center space-x-2 md:space-x-4">
							<Button
								variant="ghost"
								size="icon"
								className="relative"
								onClick={handleCartClick}
							>
								<ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
								{totalItems > 0 && (
									<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
										{totalItems > 99 ? "99+" : totalItems}
									</span>
								)}
							</Button>
							<Button variant="ghost" size="icon">
								<Heart className="h-5 w-5 md:h-6 md:w-6" />
							</Button>
							<Link href="/account">
								<Button variant="ghost" size="icon">
									<User className="h-5 w-5 md:h-6 md:w-6" />
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</header>
			<MiniCart />
		</>
	);
}
