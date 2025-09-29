"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
        DropdownMenu,
        DropdownMenuContent,
        DropdownMenuItem,
        DropdownMenuSeparator,
        DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { slugify } from "@/lib/slugify.js";

const HOME_SLUG = "home";
const CONTACT_SLUG = "contact-us";
const DESIRED_CATEGORY_ORDER = [
        "road-safety",
        "industrial-safety",
        "q-manager",
        "fire-safety",
        "road-sign",
];

const toNumber = (value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeNavigationOrder = (value) => {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed < 0) {
                return 0;
        }

        return Math.floor(parsed);
};

const hasProductCount = (count) => toNumber(count) > 0;

const categoryHasProducts = (category) => {
        if (!category) return false;

        if (hasProductCount(category.productCount)) {
                return true;
        }

        return (category.subCategories || []).some((subCategory) =>
                hasProductCount(subCategory.productCount)
        );
};

const subCategoryHasProducts = (subCategory) =>
        hasProductCount(subCategory?.productCount);

const createCategoryComparator = () => {
        const orderMap = new Map(
                DESIRED_CATEGORY_ORDER.map((slug, index) => [slug, index])
        );

        return (a, b) => {
                const orderA = orderMap.get(a.slug);
                const orderB = orderMap.get(b.slug);
                const hasOrderA = orderA !== undefined;
                const hasOrderB = orderB !== undefined;

                if (hasOrderA && hasOrderB && orderA !== orderB) {
                        return orderA - orderB;
                }

                if (hasOrderA && !hasOrderB) {
                        return -1;
                }

                if (!hasOrderA && hasOrderB) {
                        return 1;
                }

                if (a.navigationOrder !== b.navigationOrder) {
                        return a.navigationOrder - b.navigationOrder;
                }

                return a.name.localeCompare(b.name);
        };
};

export default function NavigationBar({ isMenuOpen = false, onMenuClose }) {
        const router = useRouter();
        const pathname = usePathname();
        const searchParams = useSearchParams();

        const [categories, setCategories] = useState([]);
        const [isLoadingCategories, setIsLoadingCategories] = useState(true);
        const [activeCategorySlug, setActiveCategorySlug] = useState(HOME_SLUG);
        const [activeSubCategorySlug, setActiveSubCategorySlug] = useState("");

        const closeMenuIfNeeded = () => {
                if (onMenuClose) onMenuClose();
        };

        useEffect(() => {
                let isMounted = true;

                const fetchCategories = async () => {
                        try {
                                const response = await fetch("/api/categories");
                                const data = await response.json();

                                if (!isMounted) return;

                                if (data.success && Array.isArray(data.categories)) {
                                        const categoryComparator = createCategoryComparator();

                                        const mappedCategories = data.categories
                                                .map((category) => {
                                                        const categorySlug = slugify(
                                                                category.slug || category.name
                                                        );

                                                        return {
                                                                ...category,
                                                                navigationOrder: normalizeNavigationOrder(
                                                                        category.navigationOrder
                                                                ),
                                                                productCount: toNumber(category.productCount),
                                                                slug: categorySlug,
                                                                subCategories: (category.subCategories || [])
                                                                        .map((subCategory) => ({
                                                                                ...subCategory,
                                                                                navigationOrder:
                                                                                        normalizeNavigationOrder(
                                                                                                subCategory.navigationOrder
                                                                                        ),
                                                                                productCount: toNumber(
                                                                                        subCategory.productCount
                                                                                ),
                                                                                slug: slugify(
                                                                                        subCategory.slug || subCategory.name
                                                                                ),
                                                                        }))
                                                                        .sort((a, b) => {
                                                                                if (a.navigationOrder === b.navigationOrder) {
                                                                                        return a.name.localeCompare(b.name);
                                                                                }

                                                                                return (
                                                                                        a.navigationOrder -
                                                                                        b.navigationOrder
                                                                                );
                                                                        }),
                                                        };
                                                })
                                                .sort(categoryComparator);

                                        setCategories(mappedCategories);
                                } else {
                                        setCategories([]);
                                }
                        } catch (error) {
                                console.error("Failed to load categories:", error);
                                if (isMounted) {
                                        setCategories([]);
                                }
                        } finally {
                                if (isMounted) {
                                        setIsLoadingCategories(false);
                                }
                        }
                };

                fetchCategories();

                return () => {
                        isMounted = false;
                };
        }, []);

        useEffect(() => {
                const toSlug = (value) => (value ? slugify(value) : "");

                const categoryParam = toSlug(searchParams?.get("category"));
                const subCategoryParam = toSlug(searchParams?.get("subCategory"));
                const sectionParam = toSlug(searchParams?.get("section"));
                const parentParam = toSlug(searchParams?.get("parent"));
                const typeParam = toSlug(searchParams?.get("type"));

                if (pathname === "/" || pathname === "/home") {
                        setActiveCategorySlug(HOME_SLUG);
                        setActiveSubCategorySlug("");
                        return;
                }

                if (pathname.startsWith("/contact")) {
                        setActiveCategorySlug(CONTACT_SLUG);
                        setActiveSubCategorySlug("");
                        return;
                }

                if (pathname.startsWith("/products")) {
                        if (subCategoryParam) {
                                setActiveSubCategorySlug(subCategoryParam);

                                if (categories.length > 0) {
                                        const parentCategory = categories.find((category) =>
                                                category.subCategories?.some(
                                                        (subCategory) => subCategory.slug === subCategoryParam
                                                )
                                        );

                                        if (parentCategory) {
                                                setActiveCategorySlug(parentCategory.slug);
                                                return;
                                        }
                                }

                                if (categoryParam) {
                                        setActiveCategorySlug(categoryParam);
                                }

                                return;
                        }

                        if (categoryParam) {
                                setActiveCategorySlug(categoryParam);
                                setActiveSubCategorySlug("");
                                return;
                        }

                        setActiveCategorySlug("");
                        setActiveSubCategorySlug("");
                        return;
                }

                if (pathname === "/coming-soon") {
                        if (typeParam === "sub" && sectionParam) {
                                setActiveSubCategorySlug(sectionParam);

                                if (parentParam) {
                                        setActiveCategorySlug(parentParam);
                                        return;
                                }

                                if (categories.length > 0) {
                                        const parentCategory = categories.find((category) =>
                                                category.subCategories?.some(
                                                        (subCategory) => subCategory.slug === sectionParam
                                                )
                                        );

                                        if (parentCategory) {
                                                setActiveCategorySlug(parentCategory.slug);
                                                return;
                                        }
                                }

                                setActiveCategorySlug("");
                                return;
                        }

                        if (sectionParam) {
                                if (sectionParam === HOME_SLUG || sectionParam === CONTACT_SLUG) {
                                        setActiveCategorySlug(sectionParam);
                                        setActiveSubCategorySlug("");
                                        return;
                                }

                                setActiveCategorySlug(sectionParam);
                                setActiveSubCategorySlug("");
                                return;
                        }

                        setActiveCategorySlug("");
                        setActiveSubCategorySlug("");
                        return;
                }

                setActiveCategorySlug("");
                setActiveSubCategorySlug("");
        }, [pathname, searchParams, categories]);

        useEffect(() => {
                if (!activeSubCategorySlug || categories.length === 0) {
                        return;
                }

                if (
                        activeCategorySlug &&
                        categories.some((category) => category.slug === activeCategorySlug)
                ) {
                        return;
                }

                const parentCategory = categories.find((category) =>
                        category.subCategories?.some(
                                (subCategory) => subCategory.slug === activeSubCategorySlug
                        )
                );

                if (parentCategory) {
                        setActiveCategorySlug(parentCategory.slug);
                }
        }, [activeSubCategorySlug, activeCategorySlug, categories]);

        const handleHomeNavigation = () => {
                setActiveCategorySlug(HOME_SLUG);
                setActiveSubCategorySlug("");
                router.push("/home");
                closeMenuIfNeeded();
        };

        const handleContactNavigation = () => {
                setActiveCategorySlug(CONTACT_SLUG);
                setActiveSubCategorySlug("");
                router.push("/contact");
                closeMenuIfNeeded();
        };

        const handleCategorySelection = (category) => {
                const categorySlug = category.slug;

                setActiveCategorySlug(categorySlug);
                setActiveSubCategorySlug("");

                if (categoryHasProducts(category)) {
                        router.push(`/products?category=${encodeURIComponent(categorySlug)}`);
                } else {
                        const params = new URLSearchParams({
                                section: categorySlug,
                                label: category.name,
                                type: "category",
                        });

                        router.push(`/coming-soon?${params.toString()}`);
                }

                closeMenuIfNeeded();
        };

        const handleSubCategorySelection = (category, subCategory) => {
                const categorySlug = category.slug;
                const subCategorySlug = subCategory.slug;

                setActiveCategorySlug(categorySlug);
                setActiveSubCategorySlug(subCategorySlug);

                if (subCategoryHasProducts(subCategory)) {
                        const params = new URLSearchParams({
                                category: categorySlug,
                                subCategory: subCategorySlug,
                        });

                        router.push(`/products?${params.toString()}`);
                } else {
                        const params = new URLSearchParams({
                                section: subCategorySlug,
                                label: subCategory.name,
                                parent: categorySlug,
                                parentLabel: category.name,
                                type: "sub",
                        });

                        router.push(`/coming-soon?${params.toString()}`);
                }

                closeMenuIfNeeded();
        };

        const isCategoryActive = (category) =>
                activeCategorySlug === category.slug ||
                (activeSubCategorySlug &&
                        category.subCategories?.some(
                                (subCategory) => subCategory.slug === activeSubCategorySlug
                        ));

        const renderCategoryButton = (category) => {
                const active = isCategoryActive(category);
                const hasSubCategories = (category.subCategories || []).length > 0;
                const baseClasses = "justify-start lg:justify-center whitespace-nowrap";
                const activeClasses = active ? "bg-black text-white" : "hover:bg-gray-100";

                if (!hasSubCategories) {
                        return (
                                <Button
                                        key={category.slug}
                                        variant="ghost"
                                        className={`${baseClasses} ${activeClasses}`}
                                        onClick={() => handleCategorySelection(category)}
                                >
                                        {category.name}
                                </Button>
                        );
                }

                return (
                        <DropdownMenu key={category.slug}>
                                <DropdownMenuTrigger asChild>
                                        <Button
                                                variant="ghost"
                                                className={`${baseClasses} ${activeClasses} flex items-center gap-2`}
                                        >
                                                <span>{category.name}</span>
                                                <ChevronDown className="h-4 w-4" />
                                        </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="min-w-[12rem]">
                                        <DropdownMenuItem
                                                onSelect={(event) => {
                                                        event.preventDefault();
                                                        handleCategorySelection(category);
                                                }}
                                                className={
                                                        !activeSubCategorySlug && active
                                                                ? "bg-black text-white focus:bg-black focus:text-white"
                                                                : ""
                                                }
                                        >
                                                All {category.name}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        {category.subCategories.map((subCategory) => (
                                                <DropdownMenuItem
                                                        key={subCategory.slug}
                                                        onSelect={(event) => {
                                                                event.preventDefault();
                                                                handleSubCategorySelection(category, subCategory);
                                                        }}
                                                        className={
                                                                activeSubCategorySlug === subCategory.slug
                                                                        ? "bg-black text-white focus:bg-black focus:text-white"
                                                                        : ""
                                                        }
                                                >
                                                        {subCategory.name}
                                                </DropdownMenuItem>
                                        ))}
                                </DropdownMenuContent>
                        </DropdownMenu>
                );
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
                                                <Button
                                                        variant="ghost"
                                                        className={`justify-start lg:justify-center whitespace-nowrap ${
                                                                activeCategorySlug === HOME_SLUG
                                                                        ? "bg-black text-white"
                                                                        : "hover:bg-gray-100"
                                                        }`}
                                                        onClick={handleHomeNavigation}
                                                >
                                                        Home
                                                </Button>

                                                {isLoadingCategories ? (
                                                        <Button
                                                                key="loading"
                                                                variant="ghost"
                                                                disabled
                                                                className="justify-start lg:justify-center whitespace-nowrap text-gray-400"
                                                        >
                                                                Loading categories...
                                                        </Button>
                                                ) : (
                                                        categories.map((category) => renderCategoryButton(category))
                                                )}

                                                <Button
                                                        variant="ghost"
                                                        className={`justify-start lg:justify-center whitespace-nowrap ${
                                                                activeCategorySlug === CONTACT_SLUG
                                                                        ? "bg-black text-white"
                                                                        : "hover:bg-gray-100"
                                                        }`}
                                                        onClick={handleContactNavigation}
                                                >
                                                        Contact Us
                                                </Button>
                                        </div>
                                </div>
                        </div>
                </nav>
        );
}
