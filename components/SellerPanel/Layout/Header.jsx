"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import Logo from "@/public/LogoSeller1.png";

export default function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const navItems = [
		{ label: "Home", href: "/seller/" },
		{ label: "Browse Products", href: "/seller/products" },
		{ label: "Categories", href: "/seller/categories" },
		{ label: "About", href: "/seller/about" },
		{ label: "Help Center", href: "/seller/help" },
	];

	return (
		<header className="bg-neutral-800 text-white sticky top-0 z-50">
			<div className="px-10">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<div className="flex items-center">
						<Link href="/" className="flex items-center space-x-2">
							<Image
								src={Logo}
								alt="Logo"
								className="fill-white h-auto w-20 lg:w-24 object-cover"
							/>
						</Link>
					</div>

					{/* Desktop Navigation */}
					<nav className="hidden md:flex items-center space-x-8">
						{navItems.map((item) => (
							<Link
								key={item.label}
								href={item.href}
								className="text-white hover:text-amber-400 transition-colors duration-200"
							>
								{item.label}
							</Link>
						))}
					</nav>

					{/* CTA Buttons */}
					<div className="hidden md:flex items-center space-x-4">
						<button className="bg-black text-white px-4 py-2 rounded-full font-medium transition-colors duration-200">
							Become a seller
						</button>
						<button className="bg-amber-400 text-black hover:bg-amber-500 px-6 py-2 rounded-full font-medium transition-colors duration-200">
							Login
						</button>
					</div>

					{/* Mobile menu button */}
					<button
						className="md:hidden"
						onClick={() => setIsMenuOpen(!isMenuOpen)}
					>
						<svg
							className="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 6h16M4 12h16M4 18h16"
							/>
						</svg>
					</button>
				</div>

				{/* Mobile Navigation */}
				{isMenuOpen && (
					<div className="md:hidden">
						<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
							{navItems.map((item) => (
								<Link
									key={item.label}
									href={item.href}
									className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
								>
									{item.label}
								</Link>
							))}
							<div className="flex flex-col space-y-2 mt-4">
								<button className="bg-amber-400 text-black hover:bg-amber-500 px-4 py-2 rounded-full font-medium">
									Become a seller
								</button>
								<button className="bg-amber-400 text-black hover:bg-amber-500 px-4 py-2 rounded-full font-medium">
									Login
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</header>
	);
}
