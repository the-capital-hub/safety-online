"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { usePathname } from "next/navigation";
import "./globals.css";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import { useState } from "react";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

function RootLayoutClient({ children }) {
	const pathname = usePathname();
	const showFooter = pathname === "/" || pathname === "/cart";
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const handleMenuToggle = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	return (
		<>
			<Header onMenuToggle={handleMenuToggle} isMenuOpen={isMenuOpen} />
			<main className="min-h-[calc(100vh-68px)] hide-scrollbar">
				{children}
			</main>
			{showFooter && <Footer />}
		</>
	);
}

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<head>
				<title>Safety Equipment Store - Professional Safety Gear</title>
				<meta
					name="description"
					content="Your trusted source for professional safety equipment, protective gear, and industrial safety solutions."
				/>
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<RootLayoutClient>{children}</RootLayoutClient>
			</body>
		</html>
	);
}
