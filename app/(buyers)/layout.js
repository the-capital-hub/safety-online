"use client";

import Header from "@/components/BuyerPanel/Header.jsx";
import Footer from "@/components/BuyerPanel/Footer.jsx";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

export default function BuyersPanelLayout({ children }) {
	const pathname = usePathname();
	const showFooter =
		pathname === "/home" ||
		pathname === "/cart" ||
		pathname === "/children-helmet";
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	return (
		<>
			<Header
				onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
				isMenuOpen={isMenuOpen}
			/>
			<main className="min-h-[calc(100vh-68px)] hide-scrollbar">
				{children}
			</main>
			{showFooter && <Footer />}
			<Toaster />
		</>
	);
}
