"use client";

import { useState, useEffect } from "react";
import NavigationBar from "@/components/NavigationBar";

export default function ProductsLayout({ children }) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const handleMenuToggle = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const handleMenuClose = () => {
		setIsMenuOpen(false);
	};

	// Close menu when route changes (for mobile)
	useEffect(() => {
		const handleRouteChange = () => {
			setIsMenuOpen(false);
		};

		// Listen for route changes to close mobile menu
		window.addEventListener("popstate", handleRouteChange);

		return () => {
			window.removeEventListener("popstate", handleRouteChange);
		};
	}, []);

	// Close menu when clicking outside (for mobile)
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				isMenuOpen &&
				!event.target.closest("nav") &&
				!event.target.closest("button")
			) {
				setIsMenuOpen(false);
			}
		};

		document.addEventListener("click", handleClickOutside);

		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, [isMenuOpen]);

	return (
		<div className="products-layout">
			<NavigationBar isMenuOpen={isMenuOpen} onMenuClose={handleMenuClose} />
			<div className="products-content">{children}</div>
		</div>
	);
}
