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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/BuyerPanel/products/ProductCard";

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
        };
};

const formatStatValue = (value) =>
        typeof value === "number" ? value.toLocaleString() : value || "0";

export default function SellerPage() {
        const { id } = useParams();
        const [seller, setSeller] = useState(null);
        const [products, setProducts] = useState([]);
        const [categories, setCategories] = useState(["All Products"]);
        const [brands, setBrands] = useState([]);
        const [activeCategory, setActiveCategory] = useState("All Products");
        const [searchQuery, setSearchQuery] = useState("");
        const [sellerLoading, setSellerLoading] = useState(true);
        const [productsLoading, setProductsLoading] = useState(true);
        const [stats, setStats] = useState({
                totalProducts: 0,
                categoriesCount: 0,
                brandsCount: 0,
        });

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

        const filteredProducts = useMemo(() => {
                const query = searchQuery.trim().toLowerCase();
                if (!query) {
                        return products;
                }

                return products.filter((product) => {
                        const title = product.title?.toLowerCase?.() || "";
                        const description = product.description?.toLowerCase?.() || "";
                        const brand = product.brand?.toLowerCase?.() || "";

                        return (
                                title.includes(query) ||
                                description.includes(query) ||
                                brand.includes(query)
                        );
                });
        }, [products, searchQuery]);

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

                        <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-4">
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
