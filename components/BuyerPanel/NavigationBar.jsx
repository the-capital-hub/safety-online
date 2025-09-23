"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const MENU_ITEMS = [
        { label: "Home", slug: "home" },
        { label: "Road Safety", slug: "road-safety" },
        { label: "Industrial Safety", slug: "industrial-safety" },
        { label: "Q-Manager", slug: "q-manager" },
        { label: "Fire Safety", slug: "fire-safety" },
        { label: "Road Sign", slug: "road-sign" },
        { label: "Contact Us", slug: "contact-us" },
];

const DIRECT_ROUTES = {
        home: "/home",
        "contact-us": "/contact",
};

export default function NavigationBar({ isMenuOpen, onMenuClose }) {
        const router = useRouter();
        const pathname = usePathname();
        const searchParams = useSearchParams();
        const [activeItem, setActiveItem] = useState(MENU_ITEMS[0]?.slug || "");
        const sectionParam = searchParams.get("section");

        useEffect(() => {
                if (pathname === "/coming-soon" && sectionParam) {
                        setActiveItem(sectionParam);
                        return;
                }

                if (pathname === "/" || pathname === DIRECT_ROUTES.home) {
                        setActiveItem("home");
                        return;
                }

                if (pathname === DIRECT_ROUTES["contact-us"]) {
                        setActiveItem("contact-us");
                }
        }, [pathname, sectionParam]);

        const handleNavigation = (item) => {
                setActiveItem(item.slug);

                const directRoute = DIRECT_ROUTES[item.slug];
                if (directRoute) {
                        router.push(directRoute);
                        if (onMenuClose) onMenuClose();
                        return;
                }

                router.push(
                        `/coming-soon?section=${encodeURIComponent(
                                item.slug
                        )}&label=${encodeURIComponent(item.label)}`
                );
                if (onMenuClose) onMenuClose();
        };

        return (
                <nav
                        className={`${
                                isMenuOpen ? "block" : "hidden"
                        } lg:block bg-white border-t shadow-sm`}
                >
			<div className="px-4 lg:px-10 relative z-10">
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-4 space-y-4 lg:space-y-0 overflow-x-auto hide-scrollbar">
					<div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-4">
                                                {MENU_ITEMS.map((item) => (
                                                        <Button
                                                                key={item.slug}
                                                                variant="ghost"
                                                                className={`${
                                                                        activeItem === item.slug
                                                                                ? "bg-black text-white"
                                                                                : "hover:bg-gray-100"
                                                                } justify-start lg:justify-center whitespace-nowrap`}
                                                                onClick={() => handleNavigation(item)}
                                                        >
                                                                {item.label}
                                                        </Button>
                                                ))}
                                        </div>

                                        {/* Optional search (kept commented out as in original) */}
                                        {/* <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
                <Input
                name="searchQuery"
                placeholder="Search products..."
                className="w-full sm:w-64 pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </form> */}
				</div>
			</div>
		</nav>
	);
}
