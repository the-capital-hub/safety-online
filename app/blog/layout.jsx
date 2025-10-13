"use client";

import Header from "@/components/BuyerPanel/Header.jsx";
import Footer from "@/components/BuyerPanel/Footer.jsx";

export default function BlogLayout({ children }) {
        return (
                <div className="flex min-h-screen flex-col">
                        <Header />
                        <div className="flex-1">{children}</div>
                        <Footer />
                </div>
        );
}
