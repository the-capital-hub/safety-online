"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
        Mail,
        Phone,
        MapPin,
        ShieldCheck,
        Star,
        Search,
        Store,
        CheckCircle2,
        Grid,
        Tag,
        SlidersHorizontal,
        ArrowUpDown,
        RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import ProductCard from "@/components/BuyerPanel/products/ProductCard";
import SellerPromotionalCarousel from "@/components/BuyerPanel/seller/SellerPromotionalCarousel";

const FALLBACK_IMAGE =
        "https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png";

const getSellerInitials = (name = "") => {
        const trimmed = name.trim();
        if (!trimmed) {
                return "SO";
        }

        const parts = trimmed.split(/\s+/);
        if (parts.length === 1) {
                return parts[0].slice(0, 2).toUpperCase();
        }

        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const toSentenceCase = (str = "") =>
        str
                .toLowerCase()
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");

const formatCategoryLabel = (value = "") => {
        if (typeof value !== "string") {
                return "All Products";
        }

        const trimmed = value.trim();

        if (!trimmed) {
                return "All Products";
        }

        return trimmed
                .replace(/[-_]+/g, " ")
                .replace(/\s+/g, " ")
                .split(" ")
                .filter(Boolean)
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(" ");
};

const DEFAULT_SORT_OPTION = "recommended";

const SORT_OPTIONS = [
        { value: DEFAULT_SORT_OPTION, label: "Recommended" },
        { value: "newest", label: "Newest First" },
        { value: "price-low-high", label: "Price: Low to High" },
        { value: "price-high-low", label: "Price: High to Low" },
        { value: "name-az", label: "Name: A to Z" },
        { value: "name-za", label: "Name: Z to A" },
        { value: "rating", label: "Top Rated" },
];

const normalizeProduct = (product = {}) => {
        const salePrice =
                typeof product.salePrice === "number" && product.salePrice > 0
                        ? product.salePrice
                        : 0;
        const price =
                typeof product.price === "number"
                        ? product.price
                        : salePrice > 0
                        ? salePrice
                        : 0;
        const stocks = typeof product.stocks === "number" ? product.stocks : 0;
        const hasStock = stocks > 0;
        const effectivePrice = salePrice > 0 ? salePrice : price;
        const createdAt =
                product.createdAt ? new Date(product.createdAt).getTime() : 0;

        return {
                id: product._id?.toString?.() || product.id || "",
                title: product.title || product.name || "Product",
                description: product.description || "",
                price,
                salePrice,
                originalPrice: price,
                discountPercentage:
                        typeof product.discount === "number"
                                ? Number(product.discount.toFixed(0))
                                : product.discountPercentage || 0,
                images: Array.isArray(product.images) ? product.images : [],
                image:
                        (Array.isArray(product.images) && product.images.length > 0
                                ? product.images[0]
                                : product.image) || FALLBACK_IMAGE,
                inStock: typeof product.inStock === "boolean" ? product.inStock : hasStock,
                stocks,
                status: product.status || (hasStock ? "In Stock" : "Out of Stock"),
                type: product.type || "featured",
                rating: product.rating || 0,
                brand: product.brand || "",
                category: product.category || "",
                effectivePrice,
                createdAt,
        };
};

const formatStatValue = (value) =>
        typeof value === "number" ? value.toLocaleString() : value || "0";

const formatCurrency = (value) => {
        if (!Number.isFinite(value)) {
                return "₹0";
        }

        const normalized = Math.max(0, Math.round(value));
        return `₹${normalized.toLocaleString()}`;
};

export default function SellerPage() {
        const { id } = useParams();
        const [seller, setSeller] = useState(null);
        const [products, setProducts] = useState([]);
        const [categories, setCategories] = useState(["All Products"]);
        const [brands, setBrands] = useState([]);
        const [selectedBrands, setSelectedBrands] = useState([]);
        const [onlyInStock, setOnlyInStock] = useState(false);
        const [activeCategory, setActiveCategory] = useState("All Products");
        const [searchQuery, setSearchQuery] = useState("");
        const [sortOption, setSortOption] = useState(DEFAULT_SORT_OPTION);
        const [priceRange, setPriceRange] = useState([0, 0]);
        const [sellerLoading, setSellerLoading] = useState(true);
        const [productsLoading, setProductsLoading] = useState(true);
        const [stats, setStats] = useState({
                totalProducts: 0,
                categoriesCount: 0,
                brandsCount: 0,
        });

        const availableBrands = useMemo(() => {
                if (!Array.isArray(brands) || brands.length === 0) {
                        return [];
                }

                const uniqueBrands = new Map();

                brands.forEach((brand) => {
                        if (typeof brand !== "string") {
                                return;
                        }

                        const trimmed = brand.trim();
                        if (!trimmed) {
                                return;
                        }

                        const key = trimmed.toLowerCase();

                        if (!uniqueBrands.has(key)) {
                                uniqueBrands.set(key, trimmed);
                        }
                });

                return Array.from(uniqueBrands.values()).sort((a, b) =>
                        a.localeCompare(b)
                );
        }, [brands]);

        const priceRangeBounds = useMemo(() => {
                if (!Array.isArray(products) || products.length === 0) {
                        return { min: 0, max: 0 };
                }

                const prices = products
                        .map((product) =>
                                typeof product.effectivePrice === "number"
                                        ? product.effectivePrice
                                        : typeof product.salePrice === "number" &&
                                          product.salePrice > 0
                                        ? product.salePrice
                                        : typeof product.price === "number"
                                        ? product.price
                                        : 0
                        )
                        .filter((value) => Number.isFinite(value) && value >= 0);

                if (!prices.length) {
                        return { min: 0, max: 0 };
                }

                const min = Math.min(...prices);
                const max = Math.max(...prices);

                const normalizedMin = Math.floor(min);
                const normalizedMax = Math.ceil(max);

                return { min: normalizedMin, max: normalizedMax };
        }, [products]);

        const priceFilterState = useMemo(() => {
                const [minPrice, maxPrice] = priceRange;
                const normalizedMin = Number.isFinite(minPrice)
                        ? Math.max(priceRangeBounds.min, Math.min(priceRangeBounds.max, minPrice))
                        : priceRangeBounds.min;
                const normalizedMax = Number.isFinite(maxPrice)
                        ? Math.max(priceRangeBounds.min, Math.min(priceRangeBounds.max, maxPrice))
                        : priceRangeBounds.max;
                const hasBounds =
                        Number.isFinite(priceRangeBounds.min) &&
                        Number.isFinite(priceRangeBounds.max) &&
                        priceRangeBounds.max > priceRangeBounds.min;

                const isActive =
                        hasBounds &&
                        (normalizedMin > priceRangeBounds.min + 0.001 ||
                                normalizedMax < priceRangeBounds.max - 0.001);

                return {
                        min: normalizedMin,
                        max: normalizedMax,
                        hasBounds,
                        isActive,
                };
        }, [priceRange, priceRangeBounds]);

        const hasActiveFilters = useMemo(() => {
                return (
                        selectedBrands.length > 0 ||
                        onlyInStock ||
                        priceFilterState.isActive ||
                        sortOption !== DEFAULT_SORT_OPTION
                );
        }, [onlyInStock, priceFilterState.isActive, selectedBrands.length, sortOption]);

        const appliedFilterCount = useMemo(() => {
                let count = selectedBrands.length;

                if (onlyInStock) {
                        count += 1;
                }

                if (priceFilterState.isActive) {
                        count += 1;
                }

                return count;
        }, [onlyInStock, priceFilterState.isActive, selectedBrands.length]);

        const sliderValue = useMemo(() => {
                if (!priceFilterState.hasBounds) {
                        return [priceRangeBounds.min, priceRangeBounds.max];
                }

                const [minValue, maxValue] = priceRange;
                const boundedMin = Math.max(
                        priceRangeBounds.min,
                        Math.min(priceRangeBounds.max, minValue)
                );
                const boundedMax = Math.max(
                        priceRangeBounds.min,
                        Math.min(priceRangeBounds.max, maxValue)
                );

                if (boundedMin > boundedMax) {
                        return [boundedMin, boundedMin];
                }

                return [boundedMin, boundedMax];
        }, [priceFilterState.hasBounds, priceRange, priceRangeBounds]);

        const sliderStep = useMemo(() => {
                if (!priceFilterState.hasBounds) {
                        return 1;
                }

                const range = priceRangeBounds.max - priceRangeBounds.min;

                if (range <= 0) {
                        return 1;
                }

                return Math.max(1, Math.round(range / 40));
        }, [priceFilterState.hasBounds, priceRangeBounds]);

        const toggleBrandSelection = (brand) => {
                if (typeof brand !== "string") {
                        return;
                }

                const normalized = brand.trim();

                if (!normalized) {
                        return;
                }

                setSelectedBrands((previous) => {
                        if (previous.includes(normalized)) {
                                return previous.filter((item) => item !== normalized);
                        }

                        return [...previous, normalized];
                });
        };

        const resetFilters = () => {
                setSelectedBrands([]);
                setOnlyInStock(false);
                setSortOption(DEFAULT_SORT_OPTION);
                setSearchQuery("");
                setActiveCategory("All Products");
                setPriceRange([priceRangeBounds.min, priceRangeBounds.max]);
        };

        const handlePriceRangeChange = (value) => {
                if (!Array.isArray(value) || value.length < 2) {
                        return;
                }

                const [minValue, maxValue] = value;

                const normalizedMin = Number.isFinite(minValue)
                        ? Math.max(priceRangeBounds.min, Math.min(priceRangeBounds.max, minValue))
                        : priceRangeBounds.min;
                const normalizedMax = Number.isFinite(maxValue)
                        ? Math.max(priceRangeBounds.min, Math.min(priceRangeBounds.max, maxValue))
                        : priceRangeBounds.max;

                setPriceRange([normalizedMin, normalizedMax]);
        };

        useEffect(() => {
                if (!id) {
                        return;
                }

                let isMounted = true;

                const fetchSellerDetails = async () => {
                        setSellerLoading(true);
                        try {
                                const response = await fetch(`/api/seller/details/${id}`);
                                if (!response.ok) {
                                        throw new Error("Failed to fetch seller details");
                                }

                                const payload = await response.json();

                                if (!payload.success) {
                                        throw new Error(payload.message || "Failed to fetch seller details");
                                }

                                if (!isMounted) {
                                        return;
                                }

                                const sellerData = payload.data?.seller || null;
                                setSeller(sellerData);

                                const categoryList = payload.data?.categories || [];
                                setCategories(["All Products", ...categoryList]);

                                const brandList = payload.data?.brands || [];
                                setBrands(brandList);

                                setStats((prev) => ({
                                        ...prev,
                                        categoriesCount: categoryList.length,
                                        brandsCount: brandList.length,
                                }));
                        } catch (error) {
                                console.error("Error fetching seller details:", error);
                                if (isMounted) {
                                        setSeller(null);
                                }
                        } finally {
                                if (isMounted) {
                                        setSellerLoading(false);
                                }
                        }
                };

                fetchSellerDetails();

                return () => {
                        isMounted = false;
                };
        }, [id]);

        useEffect(() => {
                if (!id) {
                        return;
                }

                let isMounted = true;

                const fetchSellerProducts = async () => {
                        setProductsLoading(true);
                        try {
                                const params = new URLSearchParams({
                                        sellerId: id,
                                        limit: "100",
                                });

                                if (activeCategory && activeCategory !== "All Products") {
                                        params.set("category", activeCategory);
                                }

                                const response = await fetch(`/api/seller/products?${params.toString()}`);
                                if (!response.ok) {
                                        throw new Error("Failed to fetch seller products");
                                }

                                const payload = await response.json();

                                if (!payload.success) {
                                        throw new Error(payload.message || "Failed to fetch seller products");
                                }

                                if (!isMounted) {
                                        return;
                                }

                                const normalizedProducts = (payload.data?.products || []).map(normalizeProduct);
                                setProducts(normalizedProducts);

                                setStats((prev) => ({
                                        ...prev,
                                        totalProducts:
                                                payload.data?.pagination?.total ?? normalizedProducts.length,
                                }));
                        } catch (error) {
                                console.error("Error fetching seller products:", error);
                                if (isMounted) {
                                        setProducts([]);
                                        setStats((prev) => ({ ...prev, totalProducts: 0 }));
                                }
                        } finally {
                                if (isMounted) {
                                        setProductsLoading(false);
                                }
                        }
                };

                fetchSellerProducts();

                return () => {
                        isMounted = false;
                };
        }, [id, activeCategory]);

        useEffect(() => {
                if (!products.length) {
                        setPriceRange([0, 0]);
                        return;
                }

                const { min, max } = priceRangeBounds;

                if (!Number.isFinite(min) || !Number.isFinite(max)) {
                        setPriceRange([0, 0]);
                        return;
                }

                setPriceRange((previous) => {
                        if (previous[0] === min && previous[1] === max) {
                                return previous;
                        }

                        return [min, max];
                });
        }, [priceRangeBounds.min, priceRangeBounds.max, products.length]);

        const filteredProducts = useMemo(() => {
                const query = searchQuery.trim().toLowerCase();
                const hasQuery = query.length > 0;
                const brandSet = new Set(
                        selectedBrands.map((brand) => brand.trim().toLowerCase())
                );
                const hasBrandFilter = brandSet.size > 0;

                const getPriceValue = (product) =>
                        typeof product.effectivePrice === "number"
                                ? product.effectivePrice
                                : typeof product.salePrice === "number" && product.salePrice > 0
                                ? product.salePrice
                                : typeof product.price === "number"
                                ? product.price
                                : 0;

                const filtered = products.filter((product) => {
                        if (hasQuery) {
                                const title = product.title?.toLowerCase?.() || "";
                                const description = product.description?.toLowerCase?.() || "";
                                const brand = product.brand?.toLowerCase?.() || "";

                                const matchesQuery =
                                        title.includes(query) ||
                                        description.includes(query) ||
                                        brand.includes(query);

                                if (!matchesQuery) {
                                        return false;
                                }
                        }

                        if (hasBrandFilter) {
                                const brand = product.brand?.trim().toLowerCase() || "";

                                if (!brandSet.has(brand)) {
                                        return false;
                                }
                        }

                        if (onlyInStock) {
                                const isAvailable = product.inStock || product.stocks > 0;

                                if (!isAvailable) {
                                        return false;
                                }
                        }

                        if (priceFilterState.isActive) {
                                const priceValue = getPriceValue(product);

                                if (priceValue < priceFilterState.min || priceValue > priceFilterState.max) {
                                        return false;
                                }
                        }

                        return true;
                });

                const sorted = [...filtered];

                sorted.sort((a, b) => {
                        switch (sortOption) {
                                case "price-low-high":
                                        return getPriceValue(a) - getPriceValue(b);
                                case "price-high-low":
                                        return getPriceValue(b) - getPriceValue(a);
                                case "name-az":
                                        return (a.title || "").localeCompare(b.title || "");
                                case "name-za":
                                        return (b.title || "").localeCompare(a.title || "");
                                case "newest":
                                        return (b.createdAt || 0) - (a.createdAt || 0);
                                case "rating":
                                        return (b.rating || 0) - (a.rating || 0);
                                default: {
                                        const stockDifference = (b.inStock ? 1 : 0) - (a.inStock ? 1 : 0);

                                        if (stockDifference !== 0) {
                                                return stockDifference;
                                        }

                                        const ratingDifference = (b.rating || 0) - (a.rating || 0);

                                        if (ratingDifference !== 0) {
                                                return ratingDifference;
                                        }

                                        return (b.createdAt || 0) - (a.createdAt || 0);
                                }
                        }
                });

                return sorted;
        }, [
                products,
                searchQuery,
                selectedBrands,
                onlyInStock,
                priceFilterState,
                sortOption,
        ]);

        const activeCategoryLabel = useMemo(
                () => formatCategoryLabel(activeCategory),
                [activeCategory]
        );

        const headOfficeAddress = useMemo(() => {
                if (!seller?.companyAddress?.length) {
                        return null;
                }

                const normalizedAddresses = seller.companyAddress.map((addr) => ({
                        ...addr,
                        tagName: addr.tagName?.toLowerCase() || "",
                }));

                const headOffice =
                        normalizedAddresses.find((addr) => addr.tagName === "head office") ||
                        normalizedAddresses[0];

                if (!headOffice) {
                        return null;
                }

                const { building, street, city, state, pincode, country, tagName } = headOffice;

                return {
                        label: tagName ? toSentenceCase(tagName) : "Registered Address",
                        fullAddress: [building, street, city, state, pincode, country]
                                .filter(Boolean)
                                .join(", "),
                };
        }, [seller]);

        if (sellerLoading && !seller) {
                return (
                        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
                        </div>
                );
        }

        if (!seller && !sellerLoading) {
                return (
                        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                                <div className="text-center space-y-4">
                                        <h1 className="text-2xl font-bold text-gray-900">Seller Not Found</h1>
                                        <p className="text-gray-600">
                                                The requested seller could not be found or is no longer active.
                                        </p>
                                        <Link href="/products">
                                                <Button className="bg-black text-white hover:bg-gray-800">
                                                        Back to Products
                                                </Button>
                                        </Link>
                                </div>
                        </div>
                );
        }

        const sellerDisplayName = seller?.brandName || seller?.companyName || "Trusted Seller";
        const heroDescription =
                seller?.brandDescription ||
                "Authorized safety equipment partner offering reliable quality and dedicated service.";

        const heroStats = [
                { icon: Store, label: "Products", value: stats.totalProducts },
                { icon: Grid, label: "Categories", value: stats.categoriesCount },
                { icon: Tag, label: "Brands", value: stats.brandsCount },
                { icon: Star, label: "Seller Rating", value: "4.8 / 5" },
        ];

        return (
                <div className="min-h-screen bg-gray-50">
                        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-400 text-white">
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
                                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                                <div className="relative h-24 w-24 rounded-2xl overflow-hidden border border-white/30 bg-white/10 flex-shrink-0">
                                                        {seller?.companyLogo ? (
                                                                <Image
                                                                        src={seller.companyLogo}
                                                                        alt={sellerDisplayName}
                                                                        fill
                                                                        className="object-contain p-4"
                                                                />
                                                        ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-2xl font-semibold">
                                                                        {getSellerInitials(sellerDisplayName)}
                                                                </div>
                                                        )}
                                                </div>

                                                <div className="flex-1 space-y-4">
                                                        <div className="flex items-center gap-3 flex-wrap">
                                                                <h1 className="text-3xl font-bold drop-shadow-sm">
                                                                        {sellerDisplayName}
                                                                </h1>
                                                                <Badge className="bg-white/15 border-white/30 text-white flex items-center gap-1">
                                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                                        Verified Seller
                                                                </Badge>
                                                        </div>

                                                        <p className="text-white/90 max-w-3xl leading-relaxed">
                                                                {heroDescription}
                                                        </p>

                                                        <div className="flex flex-wrap gap-4 text-sm text-white/90">
                                                                {seller?.companyEmail && (
                                                                        <div className="flex items-center gap-2">
                                                                                <Mail className="h-4 w-4" />
                                                                                <span>{seller.companyEmail}</span>
                                                                        </div>
                                                                )}
                                                                {/* {seller?.phone && (
                                                                        <div className="flex items-center gap-2">
                                                                                <Phone className="h-4 w-4" />
                                                                                <span>{seller.phone}</span>
                                                                        </div>
                                                                )} */}
                                                                {headOfficeAddress && (
                                                                        <div className="flex items-start gap-2 max-w-lg">
                                                                                <MapPin className="h-4 w-4 mt-0.5" />
                                                                                <span>{headOfficeAddress.fullAddress}</span>
                                                                        </div>
                                                                )}
                                                        </div>
                                                </div>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                {heroStats.map(({ icon: Icon, label, value }) => (
                                                        <div
                                                                key={label}
                                                                className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 flex items-center gap-3 backdrop-blur"
                                                        >
                                                                <Icon className="h-5 w-5 text-white" />
                                                                <div>
                                                                        <p className="text-xs uppercase tracking-wide text-white/70">
                                                                                {label}
                                                                        </p>
                                                                        <p className="text-lg font-semibold">
                                                                                {formatStatValue(value)}
                                                                        </p>
                                                                </div>
                                                        </div>
                                                ))}
                                        </div>
                                </div>
                        </div>

                        <SellerPromotionalCarousel
                                banners={seller?.promotionalBanners}
                                sellerName={sellerDisplayName}
                        />

                        <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                        <div className="py-4 space-y-4">
                                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pb-1">
                                                                {categories.map((category) => (
                                                                        <Button
                                                                                key={category}
                                                                                variant={activeCategory === category ? "default" : "ghost"}
                                                                                className={`rounded-full text-sm transition-colors ${
                                                                                        activeCategory === category
                                                                                                ? "bg-orange-500 text-white hover:bg-orange-600"
                                                                                                : "text-gray-600 hover:text-gray-900"
                                                                                }`}
                                                                                onClick={() => setActiveCategory(category)}
                                                                        >
                                                                                {formatCategoryLabel(category)}
                                                                        </Button>
                                                                ))}
                                                        </div>

                                                        <div className="relative w-full lg:w-80">
                                                                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                                <input
                                                                        type="text"
                                                                        placeholder="Search products..."
                                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                                        value={searchQuery}
                                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                                />
                                                        </div>
                                                </div>

                                                <div className="border-t border-gray-100 pt-4 space-y-4">
                                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                                        <SlidersHorizontal className="h-4 w-4 text-orange-500" />
                                                                        <span>Filters &amp; sorting</span>
                                                                        {appliedFilterCount > 0 && (
                                                                                <Badge className="border border-orange-200 bg-orange-50 text-orange-600">
                                                                                        {appliedFilterCount} {appliedFilterCount === 1 ? "filter" : "filters"} applied
                                                                                </Badge>
                                                                        )}
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
                                                                        <Select value={sortOption} onValueChange={setSortOption}>
                                                                                <SelectTrigger className="w-full sm:w-56">
                                                                                        <ArrowUpDown className="h-4 w-4 mr-2 text-gray-500" />
                                                                                        <SelectValue placeholder="Sort products" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                        {SORT_OPTIONS.map((option) => (
                                                                                                <SelectItem key={option.value} value={option.value}>
                                                                                                        {option.label}
                                                                                                </SelectItem>
                                                                                        ))}
                                                                                </SelectContent>
                                                                        </Select>
                                                                        <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={resetFilters}
                                                                                disabled={!hasActiveFilters}
                                                                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                                                                        >
                                                                                <RotateCcw className="h-4 w-4" />
                                                                                Reset
                                                                        </Button>
                                                                </div>
                                                        </div>

                                                        {availableBrands.length > 0 && (
                                                                <div className="space-y-2">
                                                                        <div className="flex items-center justify-between gap-2">
                                                                                <span className="text-xs uppercase tracking-wide text-gray-500">
                                                                                        Brands
                                                                                </span>
                                                                                {selectedBrands.length > 0 && (
                                                                                        <span className="text-xs font-medium text-orange-600">
                                                                                                {selectedBrands.length} selected
                                                                                        </span>
                                                                                )}
                                                                        </div>
                                                                        <div className="flex flex-wrap gap-2">
                                                                                {availableBrands.map((brand) => {
                                                                                        const isSelected = selectedBrands.includes(brand);
                                                                                        return (
                                                                                                <button
                                                                                                        key={brand}
                                                                                                        type="button"
                                                                                                        onClick={() => toggleBrandSelection(brand)}
                                                                                                        className={`px-3 py-1 rounded-full border text-sm transition ${
                                                                                                                isSelected
                                                                                                                        ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                                                                                                                        : "border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600"
                                                                                                        }`}
                                                                                                >
                                                                                                        {brand}
                                                                                                </button>
                                                                                        );
                                                                                })}
                                                                        </div>
                                                                </div>
                                                        )}

                                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                                <div className="flex items-center gap-3">
                                                                        <Switch
                                                                                id="seller-in-stock-only"
                                                                                checked={onlyInStock}
                                                                                onCheckedChange={setOnlyInStock}
                                                                        />
                                                                        <label
                                                                                htmlFor="seller-in-stock-only"
                                                                                className="text-sm text-gray-600 cursor-pointer"
                                                                        >
                                                                                In stock only
                                                                        </label>
                                                                </div>

                                                                {priceFilterState.hasBounds ? (
                                                                        <div className="flex-1 w-full">
                                                                                <div className="flex flex-col gap-2">
                                                                                        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-500">
                                                                                                <span>Price range</span>
                                                                                                <span className="text-[11px] font-medium text-gray-500 sm:hidden">
                                                                                                        {formatCurrency(sliderValue[0])} - {formatCurrency(sliderValue[1])}
                                                                                                </span>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-3">
                                                                                                <span className="hidden sm:inline text-sm font-medium text-gray-700">
                                                                                                        {formatCurrency(sliderValue[0])}
                                                                                                </span>
                                                                                                <Slider
                                                                                                        value={sliderValue}
                                                                                                        min={priceRangeBounds.min}
                                                                                                        max={priceRangeBounds.max}
                                                                                                        step={sliderStep}
                                                                                                        onValueChange={handlePriceRangeChange}
                                                                                                        className="flex-1"
                                                                                                />
                                                                                                <span className="hidden sm:inline text-sm font-medium text-gray-700">
                                                                                                        {formatCurrency(sliderValue[1])}
                                                                                                </span>
                                                                                        </div>
                                                                                        <div className="sm:hidden flex justify-between text-xs font-medium text-gray-500">
                                                                                                <span>{formatCurrency(sliderValue[0])}</span>
                                                                                                <span>{formatCurrency(sliderValue[1])}</span>
                                                                                        </div>
                                                                                </div>
                                                                        </div>
                                                                ) : (
                                                                        <div className="text-sm text-gray-500">
                                                                                <span className="text-xs uppercase tracking-wide text-gray-400">Price range</span>
                                                                                <span className="ml-2 font-medium text-gray-600">
                                                                                        {formatCurrency(priceRangeBounds.min)} - {formatCurrency(priceRangeBounds.max)}
                                                                                </span>
                                                                        </div>
                                                                )}
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        </div>

                        {/* {brands.length > 0 && (
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                        <Card>
                                                <CardContent className="p-6">
                                                        <div className="flex flex-col gap-4">
                                                                <div className="flex items-center justify-between flex-wrap gap-2">
                                                                        <h2 className="text-lg font-semibold text-gray-900">
                                                                                Brands we offer
                                                                        </h2>
                                                                        <Badge className="bg-orange-100 text-orange-700 border border-orange-200">
                                                                                {brands.length} Brands
                                                                        </Badge>
                                                                </div>
                                                                <div className="flex flex-wrap gap-3">
                                                                        {brands.map((brand) => (
                                                                                <Badge
                                                                                        key={brand}
                                                                                        variant="outline"
                                                                                        className="bg-orange-50 text-orange-700 border-orange-200"
                                                                                >
                                                                                        {brand}
                                                                                </Badge>
                                                                        ))}
                                                                </div>
                                                        </div>
                                                </CardContent>
                                        </Card>
                                </div>
                        )} */}

                        <div id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                                <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                                        <div>
                                                <h2 className="text-2xl font-semibold text-gray-900">
                                                        {activeCategory === "All Products"
                                                                ? "All Products"
                                                                : `${activeCategoryLabel} Products`}
                                                </h2>
                                                <p className="text-sm text-gray-500">
                                                        Showing {filteredProducts.length.toLocaleString()} product
                                                        {filteredProducts.length === 1 ? "" : "s"}
                                                        {searchQuery
                                                                ? ` for "${searchQuery}"`
                                                                : activeCategory !== "All Products"
                                                                ? ` in ${activeCategoryLabel}`
                                                                : " from this seller"}
                                                </p>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Store className="h-4 w-4" />
                                                <span>{stats.totalProducts.toLocaleString()} listed</span>
                                        </div>
                                </div>

                                {productsLoading ? (
                                        <div className="py-20 flex items-center justify-center">
                                                <div className="h-12 w-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                                        </div>
                                ) : filteredProducts.length === 0 ? (
                                        <div className="text-center py-16">
                                                <ShieldCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                        No products found
                                                </h3>
                                                        <p className="text-gray-600">
                                                                {searchQuery
                                                                        ? `No products match "${searchQuery}". Try a different search term.`
                                                                        : `No ${
                                                                                  activeCategory !== "All Products"
                                                                                          ? activeCategoryLabel.toLowerCase()
                                                                                          : ""
                                                                          } products available from this seller yet.`}
                                                        </p>
                                        </div>
                                ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                                {filteredProducts.map((product) => (
                                                        <ProductCard key={product.id} product={product} />
                                                ))}
                                        </div>
                                )}
                        </div>

                        <div className="bg-white border-t">
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                                                About {sellerDisplayName}
                                        </h2>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <Card>
                                                        <CardContent className="p-6 space-y-4">
                                                                {seller?.gstinNumber && (
                                                                        <div className="flex items-center justify-between">
                                                                                <span className="text-gray-600">GSTIN</span>
                                                                                <span className="font-medium text-gray-900">
                                                                                        {seller.gstinNumber}
                                                                                </span>
                                                                        </div>
                                                                )}
                                                                <div className="flex items-start gap-3 text-sm text-gray-600">
                                                                        <Mail className="h-4 w-4 mt-0.5 text-orange-500" />
                                                                        <div>
                                                                                <span className="font-medium text-gray-800">
                                                                                        {seller?.companyEmail || "Email not available"}
                                                                                </span>
                                                                                <p className="text-xs text-gray-500">Customer Support</p>
                                                                        </div>
                                                                </div>
                                                                <div className="flex items-start gap-3 text-sm text-gray-600">
                                                                        <Phone className="h-4 w-4 mt-0.5 text-orange-500" />
                                                                        <div>
                                                                                <span className="font-medium text-gray-800">
                                                                                        {seller?.phone || "Phone not available"}
                                                                                </span>
                                                                                <p className="text-xs text-gray-500">Business Contact</p>
                                                                        </div>
                                                                </div>
                                                                {headOfficeAddress && (
                                                                        <div className="flex items-start gap-3 text-sm text-gray-600">
                                                                                <MapPin className="h-4 w-4 mt-0.5 text-orange-500" />
                                                                                <div>
                                                                                        <span className="font-medium text-gray-800">
                                                                                                {headOfficeAddress.label}
                                                                                        </span>
                                                                                        <p className="text-xs text-gray-500">
                                                                                                {headOfficeAddress.fullAddress}
                                                                                        </p>
                                                                                </div>
                                                                        </div>
                                                                )}
                                                        </CardContent>
                                                </Card>

                                                <Card>
                                                        <CardContent className="p-6">
                                                                <div className="grid grid-cols-2 gap-4">
                                                                        <div className="rounded-lg bg-orange-50 p-4 text-center">
                                                                                <div className="text-2xl font-semibold text-orange-600">
                                                                                        {stats.totalProducts.toLocaleString()}
                                                                                </div>
                                                                                <div className="text-sm text-gray-600">Products</div>
                                                                        </div>
                                                                        <div className="rounded-lg bg-orange-50 p-4 text-center">
                                                                                <div className="text-2xl font-semibold text-orange-600">
                                                                                        {stats.categoriesCount.toLocaleString()}
                                                                                </div>
                                                                                <div className="text-sm text-gray-600">Categories</div>
                                                                        </div>
                                                                        <div className="rounded-lg bg-orange-50 p-4 text-center">
                                                                                <div className="text-2xl font-semibold text-orange-600">
                                                                                        {stats.brandsCount.toLocaleString()}
                                                                                </div>
                                                                                <div className="text-sm text-gray-600">Brands</div>
                                                                        </div>
                                                                        <div className="rounded-lg bg-orange-50 p-4 text-center">
                                                                                <div className="text-2xl font-semibold text-orange-600 flex items-center justify-center gap-1">
                                                                                        <Star className="h-5 w-5 text-orange-500" />
                                                                                        4.8
                                                                                </div>
                                                                                <div className="text-sm text-gray-600">Seller Rating</div>
                                                                        </div>
                                                                </div>
                                                        </CardContent>
                                                </Card>
                                        </div>
                                </div>
                        </div>
                </div>
        );
}
