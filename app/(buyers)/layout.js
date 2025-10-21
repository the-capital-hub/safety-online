"use client";

import Header from "@/components/BuyerPanel/Header.jsx";
import Footer from "@/components/BuyerPanel/Footer.jsx";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function BuyersPanelLayout({ children }) {
	const pathname = usePathname();
	const showFooter =
		pathname === "/home" ||
		pathname.startsWith("/products/") ||
		pathname === "/cart" ||
		pathname === "/children-helmet";
	const [isMenuOpen, setIsMenuOpen] = useState(false);

        return (
                <>
                        <Script id="tawk-to" strategy="afterInteractive">
                                {`
                                        var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
                                        (function () {
                                                var s1 = document.createElement("script"),
                                                        s0 = document.getElementsByTagName("script")[0];
                                                s1.async = true;
                                                s1.src = "https://embed.tawk.to/68f50287a86dab1951b97b79/1j7uh3olq";
                                                s1.charset = "UTF-8";
                                                s1.setAttribute("crossorigin", "*");
                                                s0.parentNode.insertBefore(s1, s0);
                                        })();
                                `}
                        </Script>
                        <Header
                                onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
                                isMenuOpen={isMenuOpen}
			/>
			<main className="min-h-[calc(100vh-68px)] hide-scrollbar">
				{children}
			</main>
                        {showFooter && <Footer />}
                </>
        );
}
